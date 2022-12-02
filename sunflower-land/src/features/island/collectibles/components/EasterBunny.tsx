import React from "react";

import easterBunny from "assets/sfts/easter/easter_bunny_eggs.gif";
import { PIXEL_SCALE } from "features/game/lib/constants";

export const EasterBunny: React.FC = () => {
  return (
    <img
      src={easterBunny}
      style={{
        width: `${PIXEL_SCALE * 32}px`,
        bottom: "0px",
      }}
      className="absolute"
      alt="Easter Bunny"
    />
  );
};
