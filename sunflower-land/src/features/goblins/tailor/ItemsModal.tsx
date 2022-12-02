import React, { useState } from "react";
import { Modal } from "react-bootstrap";

import close from "assets/icons/close.png";

import { Panel } from "components/ui/Panel";
import { Tab } from "components/ui/Tab";
import { TabContent } from "./TabContent";
import { PIXEL_SCALE } from "features/game/lib/constants";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export type Tab = "upcoming-drops" | "collection";

export const ItemsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<Tab>("upcoming-drops");

  return (
    <Modal centered show={isOpen} onHide={onClose}>
      <Panel className="relative" hasTabs>
        <div
          className="absolute flex"
          style={{
            top: `${PIXEL_SCALE * 1}px`,
            left: `${PIXEL_SCALE * 1}px`,
            right: `${PIXEL_SCALE * 1}px`,
          }}
        >
          <Tab
            isActive={tab === "upcoming-drops"}
            onClick={() => setTab("upcoming-drops")}
          >
            <span className="text-sm ml-1">Upcoming</span>
          </Tab>
          <Tab
            isActive={tab === "collection"}
            onClick={() => setTab("collection")}
          >
            <span className="text-sm ml-1">Collection</span>
          </Tab>
          <img
            src={close}
            className="absolute cursor-pointer z-20"
            onClick={onClose}
            style={{
              top: `${PIXEL_SCALE * 1}px`,
              right: `${PIXEL_SCALE * 1}px`,
              width: `${PIXEL_SCALE * 11}px`,
            }}
          />
        </div>

        <div
          style={{
            minHeight: "200px",
          }}
        >
          <TabContent tab={tab} />
        </div>
      </Panel>
    </Modal>
  );
};
