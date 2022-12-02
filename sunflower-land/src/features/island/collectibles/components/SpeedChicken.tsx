import React from "react";

import speedChicken from "assets/animals/chickens/speed_chicken.gif";
import { PIXEL_SCALE } from "features/game/lib/constants";

export const SpeedChicken: React.FC = () => {
  return (
    <div
      className="absolute"
      style={{
        width: `${PIXEL_SCALE * 15}px `,
        bottom: `${PIXEL_SCALE * 0}px `,
      }}
    >
      <img
        src={speedChicken}
        style={{
          width: `${PIXEL_SCALE * 15}px`,
          bottom: `${PIXEL_SCALE * 0}px `,
        }}
        alt="Speed Chicken"
      />
    </div>
  );
};
