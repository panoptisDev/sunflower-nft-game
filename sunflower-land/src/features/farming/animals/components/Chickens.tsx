import React, { useContext } from "react";
import { useActor } from "@xstate/react";

import coop from "assets/sfts/chicken_coop.png";
import speedChicken from "assets/animals/chickens/speed_chicken.gif";
import richChicken from "assets/animals/chickens/rich_chicken.gif";
import fatChicken from "assets/animals/chickens/fat_chicken.gif";

import { GRID_WIDTH_PX, CHICKEN_POSITIONS } from "features/game/lib/constants";
import { Context } from "features/game/GameProvider";
import { Section } from "lib/utils/hooks/useScrollIntoView";

import { Chicken } from "./Chicken";
import { getMaxChickens } from "features/game/events/feedChicken";

export const Chickens: React.FC = () => {
  const { gameService } = useContext(Context);
  const [
    {
      context: { state },
    },
  ] = useActor(gameService);

  /**
   * Round down if the player has fractional amount of chickens
   * 3.000000000000000001 chickens should show 3 chickens.
   */
  const chickenCount = Math.floor(state.inventory.Chicken?.toNumber() ?? 0);

  const chickens = new Array(chickenCount).fill(null);
  const maxChickens = getMaxChickens(state.inventory);

  return (
    <>
      {state.inventory["Chicken Coop"] && (
        <img
          src={coop}
          style={{
            width: `${GRID_WIDTH_PX * 2}px`,
            right: `${GRID_WIDTH_PX * 1.1}px`,
            top: `${GRID_WIDTH_PX * -1}px`,
          }}
          id={Section["Chicken Coop"]}
          className="absolute"
        />
      )}
      {state.inventory["Speed Chicken"] && (
        <img
          src={speedChicken}
          style={{
            width: `${GRID_WIDTH_PX * 0.8}px`,
            right: `${GRID_WIDTH_PX * -0.15}px`,
            top: `${GRID_WIDTH_PX * -0.57}px`,
          }}
          id={Section["Speed Chicken"]}
          className="absolute"
        />
      )}
      {state.inventory["Rich Chicken"] && (
        <img
          src={richChicken}
          style={{
            width: `${GRID_WIDTH_PX * 1.07}px`,
            right: `${GRID_WIDTH_PX * 3.4}px`,
            top: `${GRID_WIDTH_PX * -0.3}px`,
          }}
          id={Section["Rich Chicken"]}
          className="absolute"
        />
      )}
      {state.inventory["Fat Chicken"] && (
        <img
          src={fatChicken}
          style={{
            width: `${GRID_WIDTH_PX * 0.8}px`,
            right: `${GRID_WIDTH_PX * 2.9}px`,
            top: `${GRID_WIDTH_PX * -2.3}px`,
          }}
          id={Section["Fat Chicken"]}
          className="absolute"
        />
      )}

      <div
        className="flex flex-wrap absolute"
        style={{
          width: `${GRID_WIDTH_PX * 12.8}px`,
          height: `${GRID_WIDTH_PX * 4.2}px`,
          left: `${GRID_WIDTH_PX * 8.3}px`,
          bottom: `${GRID_WIDTH_PX * 2.1}px`,
        }}
      >
        {/* Limit to max number of chickens */}
        {chickens.slice(0, maxChickens).map((_, index) => (
          <Chicken
            index={index}
            key={index}
            position={CHICKEN_POSITIONS[index]}
          />
        ))}
      </div>
    </>
  );
};
