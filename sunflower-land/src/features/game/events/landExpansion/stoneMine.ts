import Decimal from "decimal.js-light";
import { STONE_RECOVERY_TIME } from "features/game/lib/constants";
import { trackActivity } from "features/game/types/bumpkinActivity";
import { BumpkinSkillName } from "features/game/types/bumpkinSkills";
import cloneDeep from "lodash.clonedeep";
import { GameState, LandExpansionRock } from "../../types/game";

export type LandExpansionStoneMineAction = {
  type: "stoneRock.mined";
  expansionIndex: number;
  index: number;
};

type Options = {
  state: Readonly<GameState>;
  action: LandExpansionStoneMineAction;
  createdAt?: number;
};

type GetMinedAtArgs = {
  skills: Partial<Record<BumpkinSkillName, number>>;
  createdAt: number;
};

export function canMine(rock: LandExpansionRock, now: number = Date.now()) {
  const recoveryTime = STONE_RECOVERY_TIME;
  return now - rock.stone.minedAt > recoveryTime * 1000;
}

/**
 * Set a mined in the past to make it replenish faster
 */
export function getMinedAt({ skills, createdAt }: GetMinedAtArgs): number {
  if (skills["Coal Face"]) {
    return createdAt - STONE_RECOVERY_TIME * 0.2 * 1000;
  }

  return createdAt;
}

export function mineStone({
  state,
  action,
  createdAt = Date.now(),
}: Options): GameState {
  const stateCopy = cloneDeep(state);
  const { expansions, bumpkin } = stateCopy;
  const expansion = expansions[action.expansionIndex];

  if (!expansion) {
    throw new Error("Expansion does not exist");
  }

  const { stones } = expansion;

  if (!stones) {
    throw new Error("Expansion has no stones");
  }

  if (bumpkin === undefined) {
    throw new Error("You do not have a Bumpkin");
  }

  const rock = stones[action.index];

  if (!rock) {
    throw new Error("No rock");
  }

  if (!canMine(rock, createdAt)) {
    throw new Error("Rock is still recovering");
  }

  const toolAmount = stateCopy.inventory["Pickaxe"] || new Decimal(0);

  if (toolAmount.lessThan(1)) {
    throw new Error("No pickaxes left");
  }

  const stoneMined = rock.stone.amount;
  const amountInInventory = stateCopy.inventory.Stone || new Decimal(0);

  rock.stone = {
    minedAt: getMinedAt({
      skills: bumpkin.skills,
      createdAt: Date.now(),
    }),
    amount: 2,
  };

  stateCopy.inventory.Pickaxe = toolAmount.sub(1);
  stateCopy.inventory.Stone = amountInInventory.add(stoneMined);

  bumpkin.activity = trackActivity("Stone Mined", bumpkin.activity);

  return stateCopy;
}
