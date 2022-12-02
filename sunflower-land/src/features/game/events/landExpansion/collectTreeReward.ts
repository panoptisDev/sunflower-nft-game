import Decimal from "decimal.js-light";
import cloneDeep from "lodash.clonedeep";

import { GameState } from "../../types/game";
import { canChop, CHOP_ERRORS } from "features/game/events/landExpansion/chop";

export type CollectTreeRewardAction = {
  type: "treeReward.collected";
  expansionIndex: number;
  treeIndex: number;
};

type Options = {
  state: GameState;
  action: CollectTreeRewardAction;
  createdAt?: number;
};

export function collectTreeReward({
  state,
  action,
  createdAt = Date.now(),
}: Options) {
  const stateCopy = cloneDeep(state);
  const tree =
    stateCopy.expansions[action.expansionIndex]?.trees?.[action.treeIndex];

  if (!tree) {
    throw new Error("Tree does not exist");
  }

  const { wood } = tree;

  if (!wood) {
    throw new Error("Tree has not been chopped");
  }

  if (!wood.reward) {
    throw new Error("Tree does not have a reward");
  }

  if (!canChop(tree, createdAt)) {
    throw new Error(CHOP_ERRORS.STILL_GROWING);
  }

  const {
    reward: { items, sfl },
  } = wood;

  if (items?.length) {
    items.forEach(({ name, amount }) => {
      const itemBalance = stateCopy.inventory[name] || new Decimal(0);

      stateCopy.inventory[name] = itemBalance.add(new Decimal(amount));
    });
  }

  if (sfl) {
    stateCopy.balance = stateCopy.balance.add(sfl);
  }

  delete wood.reward;

  return stateCopy;
}
