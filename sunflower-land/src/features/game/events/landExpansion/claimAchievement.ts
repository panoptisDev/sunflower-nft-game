import Decimal from "decimal.js-light";
import {
  AchievementName,
  ACHIEVEMENTS,
} from "features/game/types/achievements";
import { getKeys } from "features/game/types/craftables";
import { GameState } from "features/game/types/game";
import cloneDeep from "lodash.clonedeep";

export type ClaimAchievementAction = {
  type: "achievement.claimed";
  achievement: AchievementName;
};

type Options = {
  state: Readonly<GameState>;
  action: ClaimAchievementAction;
};

const clone = (state: GameState): GameState => {
  return cloneDeep(state);
};

export function claimAchievement({ state, action }: Options): GameState {
  const stateCopy = clone(state);
  const bumpkin = stateCopy.bumpkin;
  const achievement = ACHIEVEMENTS()[action.achievement];

  if (!bumpkin) {
    throw new Error("You do not have a Bumpkin");
  }

  if (bumpkin.achievements?.[action.achievement]) {
    throw new Error("You already have this achievement");
  }

  if (achievement.progress(stateCopy) < achievement.requirement) {
    throw new Error("You do not meet the requirements");
  }

  const bumpkinAchievments = bumpkin.achievements || {};

  bumpkin.achievements = { ...bumpkinAchievments, [action.achievement]: 1 };

  if (achievement.sfl) {
    stateCopy.balance = stateCopy.balance.add(achievement.sfl);
  }

  if (achievement.rewards) {
    getKeys(achievement.rewards).forEach((name) => {
      const previousAmount = stateCopy.inventory[name] || new Decimal(0);

      stateCopy.inventory[name] = previousAmount.add(
        achievement.rewards?.[name] || 0
      );
    });
  }

  return stateCopy;
}
