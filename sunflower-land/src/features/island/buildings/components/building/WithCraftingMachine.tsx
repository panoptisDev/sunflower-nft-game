import React, { useContext } from "react";
import { useInterpret, useSelector } from "@xstate/react";
import isEmpty from "lodash.isempty";
import { Context } from "features/game/GameProvider";
import {
  CraftingContext,
  craftingMachine,
  MachineInterpreter,
  MachineState,
} from "../../lib/craftingMachine";
import { BuildingProps } from "./Building";
import { ConsumableName } from "features/game/types/consumables";

const isIdle = (state: MachineState) => state.matches("idle");
const isCrafting = (state: MachineState) => state.matches("crafting");
const isReady = (state: MachineState) => state.matches("ready");
const itemName = (state: MachineState) => state.context.name;

export interface CraftingMachineChildProps extends BuildingProps {
  idle: boolean;
  crafting: boolean;
  ready: boolean;
  name?: ConsumableName;
  craftingService: MachineInterpreter;
  handleShowCraftingTimer: () => void;
}

/**
 * Wrapper component for buildings that have the ability to craft items. This wrapper will
 * inject the craftingMachine into the building which will handle the crafting process for that building.
 */
export const WithCraftingMachine = ({
  craftingState,
  buildingId,
  children,
}: BuildingProps & {
  children: React.ReactElement<CraftingMachineChildProps>;
}) => {
  const { gameService } = useContext(Context);
  const craftingInProgress = craftingState && !isEmpty(craftingState);
  const craftingMachineContext: CraftingContext = {
    gameService,
    buildingId,
    ...(craftingInProgress && {
      name: craftingState.name,
      readyAt: craftingState.readyAt,
    }),
  };

  const craftingService = useInterpret(craftingMachine, {
    context: craftingMachineContext,
  }) as unknown as MachineInterpreter;

  const idle = useSelector(craftingService, isIdle);
  const crafting = useSelector(craftingService, isCrafting);
  const ready = useSelector(craftingService, isReady);
  const name = useSelector(craftingService, itemName);

  // The building component is cloned and crafting state machine props are injected into it
  const clonedChildren = React.cloneElement(children, {
    idle,
    crafting,
    ready,
    name,
    craftingService,
  });

  return <>{clonedChildren}</>;
};
