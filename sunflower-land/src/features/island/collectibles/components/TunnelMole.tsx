import React from "react";

import tunnelMole from "assets/sfts/tunnel_mole.gif";
import { PIXEL_SCALE } from "features/game/lib/constants";

export const TunnelMole: React.FC = () => {
  return (
    <div
      className="absolute"
      style={{
        width: `${PIXEL_SCALE * 20}px`,
        bottom: `${PIXEL_SCALE * 0}px`,
        right: `${PIXEL_SCALE * -1}px`,
      }}
    >
      <img
        src={tunnelMole}
        style={{
          width: `${PIXEL_SCALE * 20}px`,
          bottom: `${PIXEL_SCALE * 0}px`,
          right: `${PIXEL_SCALE * -1}px`,
        }}
        className="absolute"
        alt="Tunnel mole"
      />
    </div>
  );
};
