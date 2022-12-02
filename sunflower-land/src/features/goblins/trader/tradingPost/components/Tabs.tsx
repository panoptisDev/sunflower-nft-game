import React from "react";

import close from "assets/icons/close.png";
import token from "assets/icons/token_2.png";

import { Tab } from "components/ui/Tab";
import classNames from "classnames";
import { PIXEL_SCALE } from "features/game/lib/constants";

interface TabsProps {
  disabled: boolean;
  isSelling: boolean;
  setIsSelling: (selling: boolean) => void;
  onClose: () => void;
}

export const Tabs: React.FC<TabsProps> = ({
  disabled,
  isSelling,
  setIsSelling,
  onClose,
}) => (
  <div
    className="absolute flex"
    style={{
      top: `${PIXEL_SCALE * 1}px`,
      left: `${PIXEL_SCALE * 1}px`,
      right: `${PIXEL_SCALE * 1}px`,
    }}
  >
    <Tab
      className={classNames("flex items-center", {
        "cursor-pointer": !disabled,
        "cursor-not-allowed": disabled,
      })}
      isActive={isSelling}
      onClick={!disabled ? () => setIsSelling(true) : undefined}
    >
      <img src={token} className="h-4 sm:h-5 mr-2" />
      <span className="text-sm overflow-hidden text-ellipsis">Sell</span>
    </Tab>
    <Tab
      className={classNames("flex items-center", {
        "cursor-pointer": !disabled,
        "cursor-not-allowed": disabled,
      })}
      isActive={!isSelling}
      onClick={!disabled ? () => setIsSelling(false) : undefined}
    >
      <img src={token} className="h-4 sm:h-5 mr-2" />
      <span className="text-sm overflow-hidden text-ellipsis">Buy</span>
    </Tab>
    <img
      src={close}
      className={classNames("absolute cursor-pointer z-20", {
        "cursor-pointer": !disabled,
        "cursor-not-allowed": disabled,
      })}
      onClick={!disabled ? onClose : undefined}
      style={{
        top: `${PIXEL_SCALE * 1}px`,
        right: `${PIXEL_SCALE * 1}px`,
        width: `${PIXEL_SCALE * 11}px`,
      }}
    />
  </div>
);
