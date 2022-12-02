import { createMachine, Interpreter, assign } from "xstate";

import { Context as AuthContext } from "features/auth/lib/authMachine";

import { GameState, Inventory } from "../types/game";
import { mint } from "../actions/mint";
import {
  LimitedItem,
  LimitedItemName,
  LIMITED_ITEMS,
  makeLimitedItemsByName,
} from "../types/craftables";
import { withdraw } from "../actions/withdraw";
import {
  getOnChainState,
  LimitedItemRecipeWithMintedAt,
} from "../actions/onchain";
import { ERRORS } from "lib/errors";
import { EMPTY } from "./constants";
import { loadSession } from "../actions/loadSession";
import { wallet } from "lib/blockchain/wallet";
import { INITIAL_SESSION } from "./gameMachine";
import { wishingWellMachine } from "features/goblins/wishingWell/wishingWellMachine";
import { tradingPostMachine } from "features/goblins/trader/tradingPost/lib/tradingPostMachine";
import Decimal from "decimal.js-light";
import { CONFIG } from "lib/config";
import { getLowestGameState } from "./transforms";
import { Item } from "features/retreat/components/auctioneer/actions/auctioneerItems";
import { fetchAuctioneerDrops } from "../actions/auctioneer";
import { auctioneerMachine } from "features/retreat/auctioneer/auctioneerMachine";
import { getBumpkinLevel } from "./level";

const API_URL = CONFIG.API_URL;

export type GoblinState = Omit<GameState, "skills">;

export type OnChainLimitedItems = Record<number, LimitedItemRecipeWithMintedAt>;

export interface Context {
  state: GoblinState;
  sessionId?: string;
  errorCode?: keyof typeof ERRORS;
  farmAddress?: string;
  deviceTrackerId?: string;
  limitedItems: Partial<Record<LimitedItemName, LimitedItem>>;
  auctioneerItems: Item[];
  auctioneerId: string;
}

type MintEvent = {
  type: "MINT";
  item: LimitedItemName;
  captcha: string;
};

export type MintedEvent = {
  item: LimitedItemName;
  sessionId: string;
};

type WithdrawEvent = {
  type: "WITHDRAW";
  sfl: number;
  ids: number[];
  amounts: string[];
  captcha: string;
};

type OpeningWishingWellEvent = {
  type: "OPENING_WISHING_WELL";
  authState: AuthContext;
};

type OpenTradingPostEvent = {
  type: "OPEN_TRADING_POST";
  authState: AuthContext;
};

type UpdateBalance = {
  type: "UPDATE_BALANCE";
  newBalance: Decimal;
};

type UpdateSession = {
  type: "UPDATE_SESSION";
  inventory: Inventory;
  balance: Decimal;
  sessionId: string;
};

export type BlockchainEvent =
  | {
      type: "REFRESH";
    }
  | {
      type: "CONTINUE";
    }
  | {
      type: "OPENING_WISHING_WELL";
    }
  | {
      type: "OPEN_TRADING_POST";
    }
  | { type: "OPEN_AUCTIONEER" }
  | { type: "CLOSE_AUCTIONEER" }
  | {
      type: "RESET";
    }
  | WithdrawEvent
  | MintEvent
  | OpeningWishingWellEvent
  | OpenTradingPostEvent
  | UpdateBalance
  | UpdateSession;

export type GoblinMachineState = {
  value:
    | "loading"
    | "wishing"
    | "minting"
    | "minted"
    | "withdrawing"
    | "withdrawn"
    | "playing"
    | "trading"
    | "auctioneer"
    | "levelRequirementNotReached"
    | "error";
  context: Context;
};

export type StateKeys = keyof Omit<GoblinMachineState, "context">;
export type StateValues = GoblinMachineState[StateKeys];

export type MachineInterpreter = Interpreter<
  Context,
  any,
  BlockchainEvent,
  GoblinMachineState
>;

const makeLimitedItemsById = (items: LimitedItemRecipeWithMintedAt[]) => {
  return items.reduce((obj, item) => {
    // Strange items showing up in rare items with 0 values and 0 id
    if (item.mintId > 0) {
      obj[item.mintId] = item;
    }

    return obj;
  }, {} as Record<number, LimitedItemRecipeWithMintedAt>);
};

const LEVEL_REQUIREMENT = 5;

export function startGoblinVillage(authContext: AuthContext) {
  return createMachine<Context, BlockchainEvent, GoblinMachineState>(
    {
      id: "goblinMachine",
      initial: API_URL ? "loading" : "playing",
      context: {
        state: EMPTY,
        sessionId: INITIAL_SESSION,
        limitedItems: {},
        auctioneerId: "",
        auctioneerItems: [],
      },
      states: {
        loading: {
          invoke: {
            src: async () => {
              const farmId = authContext.farmId as number;

              const onChainStateFn = getOnChainState({
                farmAddress: authContext.address as string,
                id: Number(authContext.farmId),
              });

              const auctioneerItemsFn = fetchAuctioneerDrops(
                authContext.rawToken as string
              );

              // Get session id
              const sessionIdFn = wallet
                .getSessionManager()
                .getSessionId(farmId);

              const [onChainState, { id, items }, sessionId] =
                await Promise.all([
                  onChainStateFn,
                  auctioneerItemsFn,
                  sessionIdFn,
                ]);

              const response = await loadSession({
                farmId,
                sessionId,
                token: authContext.rawToken as string,
                bumpkinTokenUri: onChainState.bumpkin?.tokenURI,
              });

              const game = response?.game as GameState;

              // Show whatever is lower, on chain or offchain
              const availableState = getLowestGameState({
                first: onChainState.game,
                second: game,
              });

              game.id = farmId;
              game.balance = availableState.balance;
              game.inventory = availableState.inventory;
              game.farmAddress = onChainState.game.farmAddress;

              const limitedItemsById = makeLimitedItemsById(
                onChainState.limitedItems
              );

              return {
                state: game,
                limitedItems: limitedItemsById,
                sessionId,
                deviceTrackerId: response?.deviceTrackerId,
                auctioneerItems: items,
                auctioneerId: id,
              };
            },
            onDone: [
              {
                target: "levelRequirementNotReached",
                cond: (_, event) => {
                  if (!authContext.migrated) return false;

                  const { bumpkin } = event.data.state;

                  if (!bumpkin) return true;

                  const bumpkinLevel = getBumpkinLevel(bumpkin.experience);

                  return bumpkinLevel < LEVEL_REQUIREMENT;
                },
              },
              {
                target: "playing",
                actions: assign({
                  state: (_, event) => event.data.state,
                  limitedItems: (_, event) =>
                    makeLimitedItemsByName(
                      LIMITED_ITEMS,
                      event.data.limitedItems
                    ),
                  sessionId: (_, event) => event.data.sessionId,
                  deviceTrackerId: (_, event) => event.data.deviceTrackerId,
                  auctioneerItems: (_, event) => event.data.auctioneerItems,
                  auctioneerId: (_, event) => event.data.auctioneerId,
                }),
              },
            ],
            onError: {},
          },
        },
        levelRequirementNotReached: {
          // Go back... you have no business being here :)
          entry: () => history.go(-1),
        },
        playing: {
          on: {
            MINT: {
              target: "minting",
            },
            WITHDRAW: {
              target: "withdrawing",
            },
            OPENING_WISHING_WELL: {
              target: "wishing",
            },
            OPEN_TRADING_POST: {
              target: "trading",
            },
            OPEN_AUCTIONEER: {
              target: "auctioneer",
            },
          },
        },
        auctioneer: {
          invoke: {
            id: "auctioneer",
            autoForward: true,
            src: auctioneerMachine,
            data: {
              token: () => authContext.rawToken,
              farmId: () => authContext.farmId,
              sessionId: (context: Context) => context.sessionId,
              auctioneerItems: (context: Context) => context.auctioneerItems,
              auctioneerId: (context: Context) => context.auctioneerId,
            },
            onDone: {
              target: "loading",
            },
            onError: [
              {
                target: "playing",
                cond: (_, event: any) =>
                  event.data.message === ERRORS.REJECTED_TRANSACTION,
              },
              {
                target: "error",
                actions: "assignErrorMessage",
              },
            ],
          },
          on: {
            CLOSE_AUCTIONEER: {
              target: "playing",
            },
          },
        },
        wishing: {
          invoke: {
            id: "wishingWell",
            autoForward: true,
            src: wishingWellMachine,
            data: {
              farmId: () => authContext.farmId,
              bumpkinTokenUri: (context: Context) =>
                context.state.bumpkin?.tokenUri,
              farmAddress: () => authContext.address,
              sessionId: (context: Context) => context.sessionId,
              token: () => authContext.rawToken,
              balance: (context: Context) => context.state.balance,
            },
            onDone: {
              target: "playing",
            },
          },
          on: {
            UPDATE_BALANCE: {
              actions: assign({
                state: (context, event) => {
                  if (event.newBalance) {
                    return {
                      ...context.state,
                      balance: (event as UpdateBalance).newBalance,
                    };
                  }

                  return context.state;
                },
              }),
            },
          },
        },
        trading: {
          invoke: {
            id: "tradingPost",
            autoForward: true,
            src: tradingPostMachine,
            data: {
              farmId: () => authContext.farmId,
              farmAddress: () => authContext.address,
              token: () => authContext.rawToken,
              deviceTrackerId: (context: Context) => context.deviceTrackerId,
            },
            onDone: {
              target: "playing",
            },
            onError: [
              {
                target: "playing",
                cond: (_, event: any) =>
                  event.data.message === ERRORS.REJECTED_TRANSACTION,
              },
              {
                target: "error",
                actions: "assignErrorMessage",
              },
            ],
          },
          on: {
            UPDATE_SESSION: {
              actions: assign({
                state: (context, event) => ({
                  ...context.state,
                  inventory: event.inventory,
                  balance: event.balance,
                  sessionId: event.sessionId,
                }),
              }),
            },
          },
        },
        minting: {
          invoke: {
            src: async (context, event) => {
              const { item, captcha } = event as MintEvent;

              const { sessionId } = await mint({
                farmId: Number(authContext.farmId),
                sessionId: context.sessionId as string,
                token: authContext.rawToken as string,
                item,
                captcha,
              });

              return {
                sessionId,
                item,
              } as MintedEvent;
            },
            onDone: {
              target: "minted",
              actions: assign((_, event) => ({
                sessionId: event.data.sessionId,
                actions: [],
              })),
            },
            onError: {
              target: "error",
              actions: "assignErrorMessage",
            },
          },
        },
        minted: {
          on: {
            REFRESH: "loading",
          },
        },
        withdrawing: {
          invoke: {
            src: async (context, event) => {
              const { amounts, ids, sfl, captcha } = event as WithdrawEvent;

              const { sessionId } = await withdraw({
                farmId: Number(authContext.farmId),
                sessionId: context.sessionId as string,
                token: authContext.rawToken as string,
                amounts,
                ids,
                sfl,
                captcha,
              });

              return {
                sessionId,
              };
            },
            onDone: {
              target: "withdrawn",
              actions: assign({
                sessionId: (_, event) => event.data.sessionId,
              }),
            },
            onError: [
              {
                target: "playing",
                cond: (_, event: any) =>
                  event.data.message === ERRORS.REJECTED_TRANSACTION,
              },
              {
                target: "error",
                actions: "assignErrorMessage",
              },
            ],
          },
        },
        withdrawn: {
          on: {
            REFRESH: {
              target: "loading",
            },
          },
        },
        error: {},
      },
    },
    {
      actions: {
        assignErrorMessage: assign<Context, any>({
          errorCode: (_context, event) => event.data.message,
        }),
      },
    }
  );
}
