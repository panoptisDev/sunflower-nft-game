import React from "react";

import bear from "assets/sfts/bears/badass_bear.png";
import { PIXEL_SCALE } from "features/game/lib/constants";

export const BadassBear: React.FC = () => {
  return (
    <div
      className="absolute"
      style={{
        width: `${PIXEL_SCALE * 18}px`,
        bottom: 0,
        left: 0,
      }}
    >
      <img
        src={bear}
        style={{
          width: `${PIXEL_SCALE * 18}px`,
          bottom: `${PIXEL_SCALE * 1}px`,
          left: `${PIXEL_SCALE * 0}px`,
        }}
        className="absolute"
        alt="Angel Bear"
      />
    </div>
  );
};
