import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";

import { GRID_WIDTH_PX, PIXEL_SCALE } from "../../lib/constants";
import { Panel } from "components/ui/Panel";

import close from "assets/icons/close.png";
import trivia from "assets/npcs/trivia.gif";

export const Trivia: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <img
        style={{
          width: `${GRID_WIDTH_PX * 1.8}px`,
          top: `${GRID_WIDTH_PX * 20}px`,
          right: `${GRID_WIDTH_PX * 30}px`,
        }}
        className="hover:img-highlight cursor-pointer absolute"
        src={trivia}
        alt="Goblin Trivia"
        onClick={() => setShowModal(true)}
      />
      <Modal centered show={showModal} onHide={() => setShowModal(false)}>
        <Panel>
          <img
            src={close}
            className="absolute cursor-pointer z-20"
            onClick={() => setShowModal(false)}
            style={{
              top: `${PIXEL_SCALE * 6}px`,
              right: `${PIXEL_SCALE * 6}px`,
              width: `${PIXEL_SCALE * 11}px`,
            }}
          />
          <div className="flex flex-col justify-content-between">
            <img
              style={{
                width: `${GRID_WIDTH_PX * 3}px`,
              }}
              className="mb-2 m-auto"
              src={trivia}
              alt="Goblin Trivia"
            />
            <p className="text-left mb-2">Congratulations Team Goblin.</p>
            <p className="text-left mb-2">
              The reigning champions of Sunflower Trivia
            </p>
            <span className="text-xxs text-left">Artwork - Netherzapdos</span>
          </div>
        </Panel>
      </Modal>
    </>
  );
};
