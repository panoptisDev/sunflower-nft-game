import { useActor } from "@xstate/react";
import React, { useContext, useEffect, useState } from "react";
import Decimal from "decimal.js-light";

import { Context } from "features/game/GoblinProvider";
import { getTreasuryItems } from "features/game/actions/onchain";
import { InventoryItemName, Inventory } from "features/game/types/game";
import { ITEM_DETAILS } from "features/game/types/images";
import { Box } from "components/ui/Box";

import { getDeliverableItems } from "../lib/storageItems";

export const StorageItems: React.FC = () => {
  const { goblinService } = useContext(Context);
  const [goblinState] = useActor(goblinService);
  const [treasuryInventory, setTreasuryInventory] = useState<Inventory>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const _treasuryInventory = await getTreasuryItems();

      setTreasuryInventory(getDeliverableItems(_treasuryInventory));
      setLoading(false);
    };

    load();
  }, []);

  const resourceInventory = getDeliverableItems(
    goblinState.context.state.inventory
  );

  const resourceItems = Object.keys(resourceInventory) as InventoryItemName[];
  const treasuryItems = Object.keys(treasuryInventory) as InventoryItemName[];

  return (
    <>
      <div className="px-2 mt-3 lf">
        <p className="mb-2">Farm Storage</p>
        <div
          className="flex flex-wrap h-fit -ml-1.5 mb-2"
          style={{ minHeight: "150px" }}
        >
          {resourceItems.map((itemName) => {
            const details = ITEM_DETAILS[itemName];

            const totalCountOfItemType =
              resourceInventory[itemName] || new Decimal(0);

            return (
              <Box
                count={totalCountOfItemType}
                key={itemName}
                image={details.image}
              />
            );
          })}
        </div>

        <p>Goblin Community Treasury</p>
        {loading ? (
          <div className="my-2 loading">Loading</div>
        ) : (
          <div className="flex flex-wrap h-fit -ml-1.5 mb-2">
            {treasuryItems.map((itemName) => {
              const details = ITEM_DETAILS[itemName];

              const totalCountOfItemType =
                treasuryInventory[itemName] || new Decimal(0);

              return (
                <Box
                  count={totalCountOfItemType}
                  key={itemName}
                  image={details.image}
                />
              );
            })}
          </div>
        )}
        <div className="text-xs mb-2">
          <span>
            Goblins keep their delivery cut in the treasury. View them also on{" "}
          </span>
          <a
            href="https://opensea.io/Goblin_Treasury"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            OpenSea
          </a>
        </div>
      </div>
    </>
  );
};
