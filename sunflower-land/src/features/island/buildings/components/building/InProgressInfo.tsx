import { useActor } from "@xstate/react";
import { Box } from "components/ui/Box";
import { Bar } from "components/ui/ProgressBar";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { CONSUMABLES } from "features/game/types/consumables";
import { ITEM_DETAILS } from "features/game/types/images";
import { secondsToString } from "lib/utils/time";
import React from "react";
import { MachineInterpreter } from "../../lib/craftingMachine";

interface Props {
  craftingService: MachineInterpreter;
  onClose: () => void;
}

export const InProgressInfo: React.FC<Props> = ({
  craftingService,
  onClose,
}) => {
  const [
    {
      context: { secondsTillReady, name },
    },
  ] = useActor(craftingService);

  if (!name || !secondsTillReady) return null;

  if (secondsTillReady <= 0) {
    onClose();
  }

  const { cookingSeconds } = CONSUMABLES[name];

  return (
    <div className="flex flex-col mb-2">
      <p className="text-sm">In Progress</p>
      <div className="flex">
        <Box image={ITEM_DETAILS[name].image} />
        <div
          className="relative flex flex-col w-full"
          style={{
            marginTop: `${PIXEL_SCALE * 3}px`,
            marginBottom: `${PIXEL_SCALE * 2}px`,
          }}
          id="progress-bar"
        >
          <span className="text-xs mb-1">
            {secondsToString(secondsTillReady, { length: "medium" })}
          </span>
          <div className="relative w-full h">
            <Bar
              percentage={(1 - secondsTillReady / cookingSeconds) * 100}
              type="progress"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
