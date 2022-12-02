import React from "react";

import cactus from "assets/decorations/cactus.png";
import { PIXEL_SCALE } from "features/game/lib/constants";

export const Cactus: React.FC = () => {
  return (
    <>
      <img
        src={cactus}
        style={{
          width: `${PIXEL_SCALE * 10}px`,
          bottom: `${PIXEL_SCALE * 2}px`,
          left: `${PIXEL_SCALE * 4}px`,
        }}
        className="absolute"
        alt="Cactus"
      />
    </>
  );
};
