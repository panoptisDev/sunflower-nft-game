import React from "react";

import nancy from "assets/sfts/nancy.png";
import { PIXEL_SCALE } from "features/game/lib/constants";
export const Nancy: React.FC = () => {
  return (
    <div
      className="absolute"
      style={{
        width: `${PIXEL_SCALE * 20}px`,
        bottom: `${PIXEL_SCALE * 2}px`,
        right: `${PIXEL_SCALE * -1.5}px`,
      }}
    >
      <img
        src={nancy}
        style={{
          width: `${PIXEL_SCALE * 20}px`,
          bottom: `${PIXEL_SCALE * 2}px`,
          right: `${PIXEL_SCALE * -1.5}px`,
        }}
        alt="Nancy"
      />
    </div>
  );
};
