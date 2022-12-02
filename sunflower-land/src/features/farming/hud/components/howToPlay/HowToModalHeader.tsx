import React from "react";
import { Modal } from "react-bootstrap";
import arrowLeft from "assets/icons/arrow_left.png";
import close from "assets/icons/close.png";
import { useIsNewFarm } from "features/farming/hud/lib/onboarding";
import { PIXEL_SCALE } from "features/game/lib/constants";

interface Props {
  onClose: () => void;
  onBack?: () => void;
  title: string;
}

export const HowToModalHeader = ({ onClose, onBack, title }: Props) => {
  const canClose = !useIsNewFarm();

  return (
    <Modal.Header className="justify-start pb-2 pt-1">
      <div className="flex w-full">
        {onBack && (
          <img
            className="cursor-pointer z-20"
            src={arrowLeft}
            alt="back"
            style={{
              top: `${PIXEL_SCALE * 6}px`,
              left: `${PIXEL_SCALE * 6}px`,
              width: `${PIXEL_SCALE * 11}px`,
              marginRight: `${PIXEL_SCALE * 2}px`,
            }}
            onClick={onBack}
          />
        )}
        <span className="ml-2 mt-1">{title}</span>
        {canClose && (
          <img
            src={close}
            className="absolute cursor-pointer z-20"
            onClick={onClose}
            style={{
              top: `${PIXEL_SCALE * 6}px`,
              right: `${PIXEL_SCALE * 6}px`,
              width: `${PIXEL_SCALE * 11}px`,
            }}
          />
        )}
      </div>
    </Modal.Header>
  );
};
