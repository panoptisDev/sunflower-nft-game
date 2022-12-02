import { GameState } from "features/game/types/game";
import cloneDeep from "lodash.clonedeep";
import { trackActivity } from "features/game/types/bumpkinActivity";
import { getOrderSellPrice } from "features/game/expansion/lib/boosts";

export type FulFillGrubOrderAction = {
  type: "grubOrder.fulfilled";
  id: string;
};

type Options = {
  state: Readonly<GameState>;
  action: FulFillGrubOrderAction;
  createdAt?: number;
};

export function fulfillGrubOrder({
  state,
  action,
  createdAt = Date.now(),
}: Options): GameState {
  const game = cloneDeep(state);
  const { bumpkin } = game;
  if (bumpkin === undefined) {
    throw new Error("You do not have a Bumpkin");
  }

  if (!game.grubShop || game.grubShop.closesAt < createdAt) {
    throw new Error("Grub shop is not open");
  }

  if (game.grubOrdersFulfilled?.find((order) => order.id === action.id)) {
    throw new Error("Order is already fulfilled");
  }

  const order = game.grubShop.orders.find((order) => order.id === action.id);

  if (!order) {
    throw new Error("Order does not exist");
  }

  if (!game.inventory[order.name] || game.inventory[order.name]?.lt(1)) {
    throw new Error("Player does not have food");
  }

  // Check if order is in the first 4, unfulfilled orders.
  const unfulFilledOrders = game.grubShop.orders.filter(
    (order) =>
      !game.grubOrdersFulfilled?.find((fulfilled) => fulfilled.id === order.id)
  );
  if (unfulFilledOrders.findIndex((order) => order.id === action.id) >= 4) {
    throw new Error("Order is locked");
  }
  const sfl = getOrderSellPrice(bumpkin, order);

  bumpkin.activity = trackActivity("SFL Earned", bumpkin.activity, sfl);

  return {
    ...state,
    balance: state.balance.add(sfl),
    inventory: {
      ...state.inventory,
      [order.name]: state.inventory[order.name]?.sub(1),
    },
    grubOrdersFulfilled: [
      ...(state.grubOrdersFulfilled || []),
      {
        fulfilledAt: createdAt,
        id: order.id,
      },
    ],
  };
}
