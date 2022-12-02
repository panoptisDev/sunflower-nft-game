import React from "react";
import Decimal from "decimal.js-light";

import goblin from "assets/npcs/goblin_head.png";

import { Button } from "components/ui/Button";
import {
  FarmSlot,
  ListingStatus,
  Listing as ListingType,
} from "lib/blockchain/Trader";
import { KNOWN_ITEMS } from "features/game/types";
import { Listing } from "./Listing";

type FormEvent = Element & {
  farmId: {
    value: string;
  };
};

interface IdleProps {
  visitingFarmId?: number;
  vistingFarmSlots: FarmSlot[];
  balance: Decimal;
  onVisit: (farmId: number) => void;
  onPurchase: (listing: ListingType) => void;
}

export const Idle: React.FC<IdleProps> = ({
  visitingFarmId,
  vistingFarmSlots,
  balance,
  onVisit,
  onPurchase,
}) => {
  const visit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    const _farmId = parseInt((event.target as FormEvent).farmId.value);

    if (isNaN(_farmId) || _farmId <= 0) return;

    onVisit(_farmId);
  };

  return (
    <div className="p-2">
      {visitingFarmId && (
        <h2 className="text-sm mb-2">{`Land #${visitingFarmId} Listings`}</h2>
      )}

      {visitingFarmId &&
        vistingFarmSlots?.map((farmSlot) => {
          // if empty return dashed
          if (
            farmSlot.listing === undefined ||
            farmSlot.listing?.status != ListingStatus.LISTED
          ) {
            return (
              <div
                key={farmSlot.slotId}
                className="border-4 border-dashed border-brown-600 p-3 flex items-center justify-center mb-3"
              >
                <span className="text-sm">Empty</span>
              </div>
            );
          }

          // if listed, return a listing UI
          const listing = farmSlot.listing;
          const listingId = listing.id;
          const resourceName = KNOWN_ITEMS[listing.resourceId];
          const resourceAmount = listing.resourceAmount;

          return (
            <Listing
              onPurchase={() => onPurchase(listing)}
              key={farmSlot.slotId}
              listingId={listingId}
              resourceName={resourceName}
              resourceAmount={resourceAmount}
              sfl={listing.sfl}
              tax={listing.tax}
              balance={balance}
            />
          );
        })}

      <form
        onSubmit={visit}
        className="flex flex-col justify-center items-center space-y-3 "
      >
        {!visitingFarmId && (
          <>
            <img src={goblin} className="w-12" />
            <span className="text-sm">
              {"Ready to trade?"}
              <br />
              {"Enter a Land ID to browse what's on offer."}
            </span>
          </>
        )}
        <div className="flex items-center">
          <span className="text-shadow text-sm mr-2 whitespace-nowrap">
            {"Land ID: "}
          </span>
          <input
            type="number"
            name="farmId"
            className="text-shadow shadow-inner shadow-black bg-brown-200 w-full p-2"
          />
        </div>
        <Button className="w-full overflow-hidden text-sm" type="submit">
          Visit land
        </Button>
      </form>
    </div>
  );
};
