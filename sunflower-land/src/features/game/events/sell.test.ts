import Decimal from "decimal.js-light";
import "lib/__mocks__/configMock";
import { GameState } from "../types/game";
import { CROPS } from "../types/crops";
import { sell, SellableName } from "./sell";
import { TEST_FARM } from "../lib/constants";

const GAME_STATE: GameState = {
  ...TEST_FARM,
  fields: {},
  balance: new Decimal(0),

  inventory: {},
  trees: {},
};

describe("sell", () => {
  it("does not sell a non sellable item", () => {
    expect(() =>
      sell({
        state: GAME_STATE,
        action: {
          type: "item.sell",
          item: "Axe" as SellableName,
          amount: new Decimal(1),
        },
      })
    ).toThrow("Not for sale");
  });

  it("does not sell  an unusual amount", () => {
    expect(() =>
      sell({
        state: {
          ...GAME_STATE,
          inventory: {
            Sunflower: new Decimal(5),
          },
        },
        action: {
          type: "item.sell",
          item: "Sunflower",
          amount: new Decimal(0),
        },
      })
    ).toThrow("Invalid amount");
  });

  it("does not sell a missing item", () => {
    expect(() =>
      sell({
        state: GAME_STATE,
        action: {
          type: "item.sell",
          item: "Sunflower",
          amount: new Decimal(1),
        },
      })
    ).toThrow("Insufficient crops to sell");
  });

  it("sells an item", () => {
    const state = sell({
      state: {
        ...GAME_STATE,
        inventory: {
          Sunflower: new Decimal(5),
        },
      },
      action: {
        type: "item.sell",
        item: "Sunflower",
        amount: new Decimal(1),
      },
    });

    expect(state.inventory.Sunflower).toEqual(new Decimal(4));
    expect(state.balance).toEqual(
      GAME_STATE.balance.add(CROPS().Sunflower.sellPrice ?? 0)
    );
  });

  it("sell an item in bulk given sufficient quantity", () => {
    const state = sell({
      state: {
        ...GAME_STATE,
        inventory: {
          Sunflower: new Decimal(11),
        },
      },
      action: {
        type: "item.sell",
        item: "Sunflower",
        amount: new Decimal(10),
      },
    });

    expect(state.inventory.Sunflower).toEqual(new Decimal(1));
    expect(state.balance).toEqual(
      GAME_STATE.balance.add(
        (CROPS().Sunflower.sellPrice ?? new Decimal(0)).mul(10)
      )
    );
  });

  it("does not sell an item in bulk given insufficient quantity", () => {
    expect(() =>
      sell({
        state: {
          ...GAME_STATE,
          inventory: {
            Sunflower: new Decimal(2),
          },
        },
        action: {
          type: "item.sell",
          item: "Sunflower",
          amount: new Decimal(10),
        },
      })
    ).toThrow("Insufficient crops to sell");
  });

  it("sells a cauliflower for a normal price", () => {
    const state = sell({
      state: {
        ...GAME_STATE,
        inventory: {
          Cauliflower: new Decimal(1),
        },
      },
      action: {
        type: "item.sell",
        item: "Cauliflower",
        amount: new Decimal(1),
      },
    });

    expect(state.balance).toEqual(
      new Decimal(CROPS().Cauliflower.sellPrice ?? 0)
    );
  });
});
