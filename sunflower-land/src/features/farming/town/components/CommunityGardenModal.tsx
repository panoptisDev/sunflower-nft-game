import React from "react";
import { Modal } from "react-bootstrap";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { PIXEL_SCALE } from "features/game/lib/constants";
import merchant from "assets/npcs/merchant.gif";
import close from "assets/icons/close.png";
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityGardenModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const goToCommunityGarden = () => {
    window.location.href = `${window.location.pathname}#/community-garden`;
  };

  return (
    <Modal centered show={isOpen} onHide={onClose}>
      <Panel>
        <img
          src={close}
          className="absolute cursor-pointer z-20"
          onClick={() => onClose}
          style={{
            top: `${PIXEL_SCALE * 6}px`,
            right: `${PIXEL_SCALE * 6}px`,
            width: `${PIXEL_SCALE * 11}px`,
          }}
        />
        <div className="p-2">
          <div className="flex flex-col items-center mb-3">
            <h1 className="text-lg mb-2 text-center">
              Do you want to visit the Community Garden?
            </h1>
            <img src={merchant} alt="sunflower fence" width="100px" />
          </div>

          <p className="mb-4 text-sm block">
            Community Garden offers NFTs built entirely by the community.
          </p>

          <p className="mb-4 text-sm block">
            {`You can only use SFL that is in your personal wallet, not your
            farm's wallet.`}
          </p>

          <p className="mb-4 text-sm block">
            The Sunflower Land team does not maintain or support these features.
            Proceed at your own risk.
          </p>
        </div>

        <div className="flex">
          <Button className="ml-1" onClick={goToCommunityGarden}>
            Continue
          </Button>
        </div>
      </Panel>
    </Modal>
  );
};
