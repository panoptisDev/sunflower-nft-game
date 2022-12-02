import Decimal from "decimal.js-light";
import { TEST_FARM } from "features/game/lib/constants";
import { getKeys } from "features/game/types/craftables";
import { GameState } from "features/game/types/game";
import { makeChickens } from "./removeBuilding.test";
import {
  removeCollectible,
  REMOVE_COLLECTIBLE_ERRORS,
} from "./removeCollectible";

const GAME_STATE: GameState = {
  ...TEST_FARM,
  balance: new Decimal(0),
  inventory: {
    "Rusty Shovel": new Decimal(1),
  },
};

describe("removeCollectible", () => {
  it("does not remove non-existent collectible ", () => {
    expect(() =>
      removeCollectible({
        state: {
          ...GAME_STATE,
          collectibles: {
            Nugget: [
              {
                id: "123",
                createdAt: 0,
                coordinates: { x: 1, y: 1 },
                readyAt: 0,
              },
            ],
          },
        },
        action: {
          type: "collectible.removed",
          collectible: "Algerian Flag",
          id: "1",
        },
      })
    ).toThrow(REMOVE_COLLECTIBLE_ERRORS.INVALID_COLLECTIBLE);
  });

  it("does not remove collectible with invalid id", () => {
    expect(() =>
      removeCollectible({
        state: {
          ...GAME_STATE,
          collectibles: {
            Nugget: [
              {
                id: "123",
                createdAt: 0,
                coordinates: { x: 1, y: 1 },
                readyAt: 0,
              },
            ],
          },
        },
        action: {
          type: "collectible.removed",
          collectible: "Nugget",
          id: "1",
        },
      })
    ).toThrow(REMOVE_COLLECTIBLE_ERRORS.INVALID_COLLECTIBLE);
  });

  it("does not remove if not enough Rusty Shovel in inventory", () => {
    expect(() =>
      removeCollectible({
        state: {
          ...GAME_STATE,
          inventory: {
            "Rusty Shovel": new Decimal(0),
          },
          collectibles: {
            Nugget: [
              {
                id: "123",
                createdAt: 0,
                coordinates: { x: 1, y: 1 },
                readyAt: 0,
              },
            ],
          },
        },
        action: {
          type: "collectible.removed",
          collectible: "Nugget",
          id: "123",
        },
      })
    ).toThrow(REMOVE_COLLECTIBLE_ERRORS.NO_RUSTY_SHOVEL_AVAILABLE);
  });

  it("removes a collectible and does not affect collectibles of the same type", () => {
    const gameState = removeCollectible({
      state: {
        ...GAME_STATE,
        inventory: {
          "Rusty Shovel": new Decimal(1),
        },
        collectibles: {
          Nugget: [
            {
              id: "123",
              createdAt: 0,
              coordinates: { x: 1, y: 1 },
              readyAt: 0,
            },
            {
              id: "456",
              createdAt: 0,
              coordinates: { x: 4, y: 4 },
              readyAt: 0,
            },
            {
              id: "789",
              createdAt: 0,
              coordinates: { x: 8, y: 8 },
              readyAt: 0,
            },
          ],
        },
      },
      action: {
        type: "collectible.removed",
        collectible: "Nugget",
        id: "123",
      },
    });

    expect(gameState.collectibles.Nugget).toEqual([
      {
        id: "456",
        createdAt: 0,
        coordinates: { x: 4, y: 4 },
        readyAt: 0,
      },
      {
        id: "789",
        createdAt: 0,
        coordinates: { x: 8, y: 8 },
        readyAt: 0,
      },
    ]);
  });

  it("uses one Rusty Shovel per collectible removed", () => {
    const gameState = removeCollectible({
      state: {
        ...GAME_STATE,
        inventory: {
          "Rusty Shovel": new Decimal(2),
        },
        collectibles: {
          Nugget: [
            {
              id: "123",
              createdAt: 0,
              coordinates: { x: 1, y: 1 },
              readyAt: 0,
            },
          ],
        },
      },
      action: {
        type: "collectible.removed",
        collectible: "Nugget",
        id: "123",
      },
    });

    expect(gameState.inventory["Rusty Shovel"]).toEqual(new Decimal(1));
  });

  it("removes 5 chickens if chicken coop is removed and one hen house placed", () => {
    const gameState = removeCollectible({
      state: {
        ...GAME_STATE,
        inventory: {
          "Rusty Shovel": new Decimal(2),
        },
        chickens: makeChickens(15),
        collectibles: {
          "Chicken Coop": [
            {
              id: "123",
              createdAt: 0,
              coordinates: { x: 1, y: 1 },
              readyAt: 0,
            },
          ],
        },
        buildings: {
          "Hen House": [
            {
              id: "123",
              coordinates: { x: 1, y: 1 },
              createdAt: 0,
              readyAt: 0,
            },
          ],
        },
      },
      action: {
        type: "collectible.removed",
        collectible: "Chicken Coop",
        id: "123",
      },
    });

    expect(getKeys(gameState.chickens).length).toEqual(10);
  });

  it("removes 10 chickens if chicken coop is removed and two hen houses are placed", () => {
    const gameState = removeCollectible({
      state: {
        ...GAME_STATE,
        inventory: {
          "Rusty Shovel": new Decimal(2),
        },
        chickens: makeChickens(30),
        collectibles: {
          "Chicken Coop": [
            {
              id: "123",
              createdAt: 0,
              coordinates: { x: 1, y: 1 },
              readyAt: 0,
            },
          ],
        },
        buildings: {
          "Hen House": [
            {
              id: "123",
              coordinates: { x: 1, y: 1 },
              createdAt: 0,
              readyAt: 0,
            },
            {
              id: "345",
              coordinates: { x: 1, y: 1 },
              createdAt: 0,
              readyAt: 0,
            },
          ],
        },
      },
      action: {
        type: "collectible.removed",
        collectible: "Chicken Coop",
        id: "123",
      },
    });

    expect(getKeys(gameState.chickens).length).toEqual(20);
  });

  it("removes the collectible key if there are none of the type placed", () => {
    const gameState = removeCollectible({
      state: {
        ...GAME_STATE,
        inventory: {
          "Rusty Shovel": new Decimal(2),
        },
        chickens: makeChickens(30),
        collectibles: {
          "Rock Golem": [
            {
              id: "123",
              createdAt: 0,
              coordinates: { x: 1, y: 1 },
              readyAt: 0,
            },
          ],
        },
      },
      action: {
        type: "collectible.removed",
        collectible: "Rock Golem",
        id: "123",
      },
    });

    expect(gameState.collectibles["Rock Golem"]).toBeUndefined();
  });
});
