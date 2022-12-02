import React from "react";

import bear from "assets/sfts/bears/angel_bear.png";
import { PIXEL_SCALE } from "features/game/lib/constants";

export const AngelBear: React.FC = () => {
  return (
    <>
      <img
        src={bear}
        style={{
          width: `${PIXEL_SCALE * 25}px`,
          bottom: `${PIXEL_SCALE * 1}px`,
          left: `${PIXEL_SCALE * 4}px`,
        }}
        className="absolute"
        alt="Angel Bear"
      />
    </>
  );
};
