import { useActor } from "@xstate/react";
import React, { useContext, useEffect, useState } from "react";

import alert from "assets/icons/expression_alerted.png";
import confirm from "assets/icons/confirm.png";
import disc from "assets/icons/disc_large.png";
import busyBumpkin from "src/assets/icons/player.png";
import close from "assets/icons/close.png";

import { Context } from "features/game/GameProvider";
import {
  AchievementName,
  ACHIEVEMENTS,
} from "features/game/types/achievements";
import { getKeys } from "features/game/types/craftables";
import { ITEM_DETAILS } from "features/game/types/images";
import classNames from "classnames";
import { AchievementDetails } from "./AchievementDetails";
import Decimal from "decimal.js-light";
import { shortenCount } from "lib/utils/formatNumber";
import { Panel } from "components/ui/Panel";
import { Tab } from "components/ui/Tab";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { setImageWidth } from "lib/images";

const CONTENT_HEIGHT = 350;
interface Props {
  onBack: () => void;
  onClose: () => void;
}

export const Achievements: React.FC<Props> = ({ onBack, onClose }) => {
  const [selected, setSelected] = useState<AchievementName>("Farm Hand");

  const { gameService } = useContext(Context);
  const [
    {
      context: { state },
    },
  ] = useActor(gameService);

  const achievements = ACHIEVEMENTS();

  useEffect(() => {
    const bumpkinAchievements = state.bumpkin?.achievements || {};
    const achievementKeys = getKeys(achievements);

    const firstUnclaimedAchievementName = achievementKeys.find((name) => {
      const achievement = achievements[name];
      const progress = achievement.progress(state);
      const isComplete = progress >= achievement.requirement;
      const isAlreadyClaimed = !!bumpkinAchievements[name];

      return isComplete && !isAlreadyClaimed;
    });

    const defaultSelectedAchievement =
      firstUnclaimedAchievementName ?? achievementKeys[0];

    setSelected(defaultSelectedAchievement);
  }, []);

  const claim = () => {
    gameService.send("achievement.claimed", {
      achievement: selected,
    });
  };

  return (
    <Panel className="relative" hasTabs>
      <div
        className="absolute flex"
        style={{
          top: `${PIXEL_SCALE * 1}px`,
          left: `${PIXEL_SCALE * 1}px`,
          right: `${PIXEL_SCALE * 1}px`,
        }}
      >
        <Tab isActive>
          <img src={busyBumpkin} className="h-5 mr-2" />
          <span className="text-sm">Achievements</span>
        </Tab>
        <img
          src={close}
          className="absolute cursor-pointer z-20"
          onClick={onClose}
          style={{
            top: `${PIXEL_SCALE * 1}px`,
            right: `${PIXEL_SCALE * 1}px`,
            width: `${PIXEL_SCALE * 11}px`,
          }}
        />
      </div>

      <div
        style={{
          minHeight: "200px",
        }}
      >
        <AchievementDetails
          name={selected as AchievementName}
          onBack={onBack}
          onClaim={claim}
          state={state}
        />
      </div>
      <div className="w-full mt-2">
        <div
          style={{ maxHeight: CONTENT_HEIGHT }}
          className="overflow-y-auto scrollable flex flex-wrap pt-1"
        >
          {getKeys(achievements).map((name) => {
            const achievement = achievements[name];

            const progress = achievement.progress(state);
            const isComplete = progress >= achievement.requirement;

            const bumpkinAchievements = state.bumpkin?.achievements || {};
            const isAlreadyClaimed = !!bumpkinAchievements[name];

            return (
              <div
                className="flex flex-col items-center mb-1 w-1/3 sm:w-1/4"
                key={name}
              >
                <div
                  style={{
                    width: `${PIXEL_SCALE * 22}px`,
                    height: `${PIXEL_SCALE * 23}px`,
                  }}
                  onClick={() => setSelected(name)}
                  className={classNames(
                    "flex justify-center items-center p-1 rounded-md mr-2 relative cursor-pointer hover:img-highlight",
                    {
                      "opacity-50": !isAlreadyClaimed && !isComplete,
                      "img-highlight": selected === name,
                    }
                  )}
                >
                  <img
                    src={disc}
                    className="absolute"
                    style={{
                      width: `${PIXEL_SCALE * 22}px`,
                    }}
                  />
                  <img
                    src={ITEM_DETAILS[name].image}
                    className="absolute"
                    style={{
                      opacity: 0,
                      marginBottom: `${PIXEL_SCALE * 0.5}px`,
                    }}
                    onLoad={(e) => setImageWidth(e.currentTarget)}
                  />
                </div>

                <div className="h-10">
                  {isComplete && !isAlreadyClaimed && (
                    <div className="flex flex-1 pr-2 mt-1.5 text-xs flex-wrap justify-center">
                      <img
                        src={alert}
                        style={{
                          width: `${PIXEL_SCALE * 4}px`,
                        }}
                      />
                    </div>
                  )}
                  {isAlreadyClaimed && (
                    <div className="flex flex-1 pr-2 mt-1.5 text-xs flex-wrap justify-center">
                      <img
                        src={confirm}
                        style={{
                          width: `${PIXEL_SCALE * 12}px`,
                        }}
                      />
                    </div>
                  )}
                  {!isComplete && !isAlreadyClaimed && (
                    <div className="flex flex-1 mt-1.5 text-xxs flex-wrap justify-center">
                      <p>{`${shortenCount(
                        new Decimal(progress)
                      )}/${shortenCount(
                        new Decimal(achievement.requirement)
                      )}`}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
};
