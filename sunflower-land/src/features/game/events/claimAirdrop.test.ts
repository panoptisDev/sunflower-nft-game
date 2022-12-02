import Decimal from "decimal.js-light";
import { TEST_FARM } from "../lib/constants";
import { claimAirdrop } from "./claimAirdrop";

describe("claimAirdrop", () => {
  it("throws if no airdrops are available", () => {
    expect(() =>
      claimAirdrop({
        state: {
          ...TEST_FARM,
          airdrops: [],
        },
        action: {
          type: "airdrop.claimed",
          id: "1",
        },
      })
    ).toThrow("No airdrops exist");
  });

  it("does not open non-existent reward", () => {
    expect(() =>
      claimAirdrop({
        state: {
          ...TEST_FARM,
          airdrops: [
            {
              id: "123",
              createdAt: Date.now(),
              items: {},
              sfl: 5,
            },
          ],
        },
        action: {
          type: "airdrop.claimed",
          id: "2",
        },
      })
    ).toThrow("Airdrop #2 does not exist");
  });

  it("claims a SFL reward", () => {
    const state = claimAirdrop({
      state: {
        ...TEST_FARM,
        airdrops: [
          {
            id: "123",
            items: {},
            createdAt: Date.now(),
            sfl: 5,
          },
        ],
      },
      action: {
        type: "airdrop.claimed",
        id: "123",
      },
    });

    expect(state.balance).toEqual(new Decimal(5));
  });

  it("claims an items reward", () => {
    const state = claimAirdrop({
      state: {
        ...TEST_FARM,
        inventory: {},
        airdrops: [
          {
            id: "123",
            createdAt: Date.now(),
            items: {
              Gold: 5,
            },
            sfl: 0,
          },
        ],
      },
      action: {
        type: "airdrop.claimed",
        id: "123",
      },
    });

    expect(state.inventory).toEqual({
      Gold: new Decimal(5),
    });

    expect(state.airdrops).toEqual([]);
  });

  it("claims a reward of multiple items", () => {
    const state = claimAirdrop({
      state: {
        ...TEST_FARM,
        inventory: {
          Wood: new Decimal(5),
        },
        airdrops: [
          {
            id: "123",
            createdAt: Date.now(),
            items: {
              Gold: 5,
              Wood: 20,
            },
            sfl: 0,
          },
        ],
      },
      action: {
        type: "airdrop.claimed",
        id: "123",
      },
    });

    expect(state.inventory).toEqual({
      Gold: new Decimal(5),
      Wood: new Decimal(25),
    });
    expect(state.airdrops).toEqual([]);
  });

  it("claims multiple airdrops", () => {
    let state = claimAirdrop({
      state: {
        ...TEST_FARM,
        balance: new Decimal(2),
        inventory: {
          Sunflower: new Decimal(5),
        },
        airdrops: [
          {
            id: "123",
            createdAt: Date.now(),
            items: {
              Gold: 5,
              Wood: 20,
            },
            sfl: 0,
          },
          {
            id: "68",
            createdAt: Date.now(),
            sfl: 5,
            items: {
              Sunflower: 5,
            },
          },
        ],
      },
      action: {
        type: "airdrop.claimed",
        id: "123",
      },
    });

    expect(state.airdrops).toHaveLength(1);

    state = claimAirdrop({
      state,
      action: {
        type: "airdrop.claimed",
        id: "68",
      },
    });

    expect(state.inventory).toEqual({
      Gold: new Decimal(5),
      Wood: new Decimal(20),
      Sunflower: new Decimal(10),
    });

    expect(state.balance).toEqual(new Decimal(7));
    expect(state.airdrops).toEqual([]);
  });
});
