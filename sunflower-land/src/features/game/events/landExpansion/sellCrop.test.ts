import Decimal from "decimal.js-light";
import { GameState } from "../../types/game";
import { CropName, CROPS } from "../../types/crops";
import { sellCrop } from "./sellCrop";
import { INITIAL_BUMPKIN, TEST_FARM } from "../../lib/constants";

const GAME_STATE: GameState = {
  ...TEST_FARM,
  bumpkin: INITIAL_BUMPKIN,
  fields: {},
  balance: new Decimal(0),

  inventory: {},
  trees: {},
};

describe("sell", () => {
  it("does not sell a non sellable item", () => {
    expect(() =>
      sellCrop({
        state: GAME_STATE,
        action: {
          type: "crop.sold",
          crop: "Axe" as CropName,
          amount: 1,
        },
      })
    ).toThrow("Not for sale");
  });

  it("does not sell  an unusual amount", () => {
    expect(() =>
      sellCrop({
        state: {
          ...GAME_STATE,
          inventory: {
            Sunflower: new Decimal(5),
          },
        },
        action: {
          type: "crop.sold",
          crop: "Sunflower",
          amount: 0,
        },
      })
    ).toThrow("Invalid amount");
  });

  it("does not sell a missing item", () => {
    expect(() =>
      sellCrop({
        state: GAME_STATE,
        action: {
          type: "crop.sold",
          crop: "Sunflower",
          amount: 1,
        },
      })
    ).toThrow("Insufficient quantity to sell");
  });

  it("sells an item", () => {
    const state = sellCrop({
      state: {
        ...GAME_STATE,
        inventory: {
          Sunflower: new Decimal(5),
        },
      },
      action: {
        type: "crop.sold",
        crop: "Sunflower",
        amount: 1,
      },
    });

    expect(state.inventory.Sunflower).toEqual(new Decimal(4));
    expect(state.balance).toEqual(
      GAME_STATE.balance.add(CROPS().Sunflower.sellPrice ?? 0)
    );
  });

  it("sell an item in bulk given sufficient quantity", () => {
    const state = sellCrop({
      state: {
        ...GAME_STATE,
        inventory: {
          Sunflower: new Decimal(11),
        },
      },
      action: {
        type: "crop.sold",
        crop: "Sunflower",
        amount: 10,
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
      sellCrop({
        state: {
          ...GAME_STATE,
          inventory: {
            Sunflower: new Decimal(2),
          },
        },
        action: {
          type: "crop.sold",
          crop: "Sunflower",
          amount: 10,
        },
      })
    ).toThrow("Insufficient quantity to sell");
  });

  it("sells a cauliflower for a normal price", () => {
    const state = sellCrop({
      state: {
        ...GAME_STATE,
        inventory: {
          Cauliflower: new Decimal(1),
        },
      },
      action: {
        type: "crop.sold",
        crop: "Cauliflower",
        amount: 1,
      },
    });

    expect(state.balance).toEqual(
      new Decimal(CROPS().Cauliflower.sellPrice ?? 0)
    );
  });

  it("increments SFL earned when cauliflower is sold", () => {
    const state = sellCrop({
      state: {
        ...GAME_STATE,
        inventory: {
          Cauliflower: new Decimal(1),
        },
      },
      action: {
        type: "crop.sold",
        crop: "Cauliflower",
        amount: 1,
      },
    });

    expect(state.bumpkin?.activity?.["SFL Earned"]).toEqual(
      new Decimal(CROPS().Cauliflower.sellPrice ?? 0).toNumber()
    );
  });
});
