import Decimal from "decimal.js-light";
import { isCollectibleBuilt } from "features/game/lib/collectibleBuilt";
import {
  CHICKEN_TIME_TO_EGG,
  MUTANT_CHICKEN_BOOST_AMOUNT,
} from "features/game/lib/constants";
import {
  Bumpkin,
  Collectibles,
  GameState,
  Inventory,
} from "features/game/types/game";
import cloneDeep from "lodash.clonedeep";

export type LandExpansionFeedChickenAction = {
  type: "chicken.fed";
  index: number;
};

type Options = {
  state: Readonly<GameState>;
  action: LandExpansionFeedChickenAction;
  createdAt?: number;
};

const makeFedAt = (
  inventory: Inventory,
  collectibles: Collectibles,
  createdAt: number,
  bumpkin: Bumpkin
) => {
  const { skills } = bumpkin;
  let mul = 0;
  if (inventory["Wrangler"]?.gt(0)) {
    mul += 0.1;
  }

  if (isCollectibleBuilt("Speed Chicken", collectibles)) {
    mul += 0.1;
  }

  if (skills["Stable Hand"]) {
    mul += 0.1;
  }
  //Return default values if no boost applied
  if (!mul) {
    return createdAt;
  }

  const chickenTime = CHICKEN_TIME_TO_EGG * mul;
  return createdAt - chickenTime;
};

export const getWheatRequiredToFeed = (collectibles: Collectibles) => {
  const hasFatChicken = isCollectibleBuilt("Fat Chicken", collectibles);
  const defaultAmount = new Decimal(1);

  if (hasFatChicken) {
    return defaultAmount.minus(defaultAmount.mul(MUTANT_CHICKEN_BOOST_AMOUNT));
  }

  return defaultAmount;
};

export function getMaxChickens(collectibles: Collectibles) {
  if (isCollectibleBuilt("Chicken Coop", collectibles)) {
    return 15;
  }

  return 10;
}

export function feedChicken({
  state,
  action,
  createdAt = Date.now(),
}: Options): GameState {
  const stateCopy = cloneDeep(state);
  const { bumpkin, inventory, collectibles } = stateCopy;

  if (!bumpkin) {
    throw new Error("You do not have a Bumpkin");
  }

  const maxChickens = getMaxChickens(collectibles);

  const chickens = stateCopy.chickens || {};
  const chicken = chickens[action.index];

  if (
    !chicken &&
    (!inventory?.Chicken || inventory.Chicken?.lt(action.index))
  ) {
    throw new Error("This chicken does not exist");
  }

  if (action.index > maxChickens - 1) {
    throw new Error(`Cannot have more than ${maxChickens} chickens`);
  }

  const isChickenHungry =
    chicken?.fedAt && createdAt - chicken.fedAt < CHICKEN_TIME_TO_EGG;

  if (isChickenHungry) {
    throw new Error("This chicken is not hungry");
  }

  const wheatRequired = getWheatRequiredToFeed(collectibles);

  if (!inventory.Wheat || inventory.Wheat.lt(wheatRequired)) {
    throw new Error("No wheat to feed chickens");
  }

  const currentWheat = inventory.Wheat || new Decimal(0);
  inventory.Wheat = currentWheat.minus(wheatRequired);
  chickens[action.index] = {
    ...chickens[action.index],
    fedAt: makeFedAt(inventory, collectibles, createdAt, bumpkin),
    multiplier: 1,
  };

  return stateCopy;
}
