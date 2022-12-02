import React from "react";

import rockyTheMole from "assets/sfts/rocky_mole.gif";
import { PIXEL_SCALE } from "features/game/lib/constants";

export const RockyTheMole: React.FC = () => {
  return (
    <div
      className="absolute"
      style={{
        width: `${PIXEL_SCALE * 21}px`,
        bottom: `${PIXEL_SCALE * 0}px`,
        right: `${PIXEL_SCALE * -1.5}px`,
      }}
    >
      <img
        src={rockyTheMole}
        style={{
          width: `${PIXEL_SCALE * 21}px`,
          bottom: `${PIXEL_SCALE * 0}px`,
          right: `${PIXEL_SCALE * -1.5}px`,
        }}
        alt="Rocky The Mole"
        className="absolute"
      />
    </div>
  );
};
