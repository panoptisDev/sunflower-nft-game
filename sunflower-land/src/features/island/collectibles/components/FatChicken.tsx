import React from "react";

import fatChicken from "assets/animals/chickens/fat_chicken.gif";
import { PIXEL_SCALE } from "features/game/lib/constants";

export const FatChicken: React.FC = () => {
  return (
    <div
      className="absolute"
      style={{
        width: `${PIXEL_SCALE * 17}px `,
        bottom: `${PIXEL_SCALE * 0}px `,
      }}
    >
      <img
        src={fatChicken}
        style={{
          width: `${PIXEL_SCALE * 17}px`,
          bottom: `${PIXEL_SCALE * 0}px`,
        }}
        className="absolute"
        alt="Fat Chicken"
      />
    </div>
  );
};
