import Decimal from "decimal.js-light";
import cloneDeep from "lodash.clonedeep";

import { CROPS } from "../../types/crops";
import { GameState } from "../../types/game";

export type CollectCropRewardAction = {
  type: "cropReward.collected";
  expansionIndex: number;
  plotIndex: number;
};

type Options = {
  state: GameState;
  action: CollectCropRewardAction;
  createdAt?: number;
};

export function collectCropReward({
  state,
  action,
  createdAt = Date.now(),
}: Options) {
  const stateCopy = cloneDeep(state);
  const plot =
    stateCopy.expansions[action.expansionIndex]?.plots?.[action.plotIndex];

  if (!plot) {
    throw new Error("Plot does not exist");
  }

  const { crop: plantedCrop } = plot;

  if (!plantedCrop) {
    throw new Error("Plot does not have a crop");
  }

  if (!plantedCrop.reward) {
    throw new Error("Crop does not have a reward");
  }

  const crop = CROPS()[plantedCrop.name];

  if (createdAt - plantedCrop.plantedAt < crop.harvestSeconds * 1000) {
    throw new Error("Not ready");
  }

  const {
    reward: { items, sfl },
  } = plantedCrop;

  if (items?.length) {
    items.forEach(({ name, amount }) => {
      const itemBalance = stateCopy.inventory[name] || new Decimal(0);

      stateCopy.inventory[name] = itemBalance.add(new Decimal(amount));
    });
  }

  if (sfl) {
    stateCopy.balance = stateCopy.balance.add(sfl);
  }

  delete plantedCrop.reward;

  return stateCopy;
}
