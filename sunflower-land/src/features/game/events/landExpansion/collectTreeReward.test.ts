import Decimal from "decimal.js-light";
import { TEST_FARM } from "features/game/lib/constants";
import { collectTreeReward } from "features/game/events/landExpansion/collectTreeReward";

describe("collectTreeReward", () => {
  const dateNow = Date.now();

  it("only checks for rewards on tree that exist", () => {
    expect(() =>
      collectTreeReward({
        state: TEST_FARM,
        action: {
          type: "treeReward.collected",
          expansionIndex: 10,
          treeIndex: 30,
        },
        createdAt: dateNow,
      })
    ).toThrow("Tree does not exist");
  });

  it("checks if tree has reward", () => {
    expect(() =>
      collectTreeReward({
        state: {
          ...TEST_FARM,
          expansions: [
            {
              createdAt: 0,
              readyAt: 0,
              trees: {
                0: {
                  x: -2,
                  y: -1,
                  height: 1,
                  width: 1,
                  wood: {
                    choppedAt: dateNow,
                    amount: 1,
                  },
                },
              },
            },
          ],
        },
        action: {
          type: "treeReward.collected",
          expansionIndex: 0,
          treeIndex: 0,
        },
        createdAt: dateNow,
      })
    ).toThrow("Tree does not have a reward");
  });

  it("checks it reward is ready", () => {
    expect(() =>
      collectTreeReward({
        state: {
          ...TEST_FARM,
          expansions: [
            {
              createdAt: 0,
              readyAt: 0,
              trees: {
                0: {
                  x: -2,
                  y: -1,
                  height: 1,
                  width: 1,
                  wood: {
                    choppedAt: dateNow,
                    amount: 1,
                    reward: {
                      sfl: new Decimal(3),
                    },
                  },
                },
              },
            },
          ],
        },
        action: {
          type: "treeReward.collected",
          treeIndex: 0,
          expansionIndex: 0,
        },
        createdAt: dateNow,
      })
    ).toThrow("Tree is still growing");
  });
  it("provides sfl rewards", () => {
    const state = collectTreeReward({
      state: {
        ...TEST_FARM,
        expansions: [
          {
            createdAt: 0,
            readyAt: 0,
            trees: {
              0: {
                x: -2,
                y: -1,
                height: 1,
                width: 1,
                wood: {
                  choppedAt: 0,
                  amount: 1,
                  reward: {
                    sfl: new Decimal(10),
                  },
                },
              },
            },
          },
        ],
      },
      action: {
        type: "treeReward.collected",
        treeIndex: 0,
        expansionIndex: 0,
      },
      createdAt: dateNow,
    });

    const { expansions } = state;

    expect(expansions[0].plots?.[0]?.crop?.reward).toBeUndefined();
    expect(state.balance).toEqual(new Decimal(10));
  });
});
