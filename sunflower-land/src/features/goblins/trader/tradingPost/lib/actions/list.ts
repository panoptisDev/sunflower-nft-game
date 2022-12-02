import { toWei } from "web3-utils";

import { wallet } from "lib/blockchain/wallet";
import { CONFIG } from "lib/config";
import { ERRORS } from "lib/errors";

import { Draft } from "../../../selling/lib/sellingMachine";
import { getItemUnit } from "features/game/lib/conversion";

const API_URL = CONFIG.API_URL;

type Request = {
  slotId: number;
  farmId: number;
  token: string;
  draft: Draft;
};

type Payload = {
  farmId: number;
  fee: string;
  resourceAmount: string;
  resourceId: number;
  sender: string;
  sessionId: string;
  sfl: string;
  slotId: number;
  tax: number;
  deadline: number;
  nextSessionId: string;
};

type Response = {
  signature: string;
  payload: Payload;
};

export async function listRequest(request: Request): Promise<Response> {
  // Call backend list-trade
  const response = await window.fetch(
    `${API_URL}/list-trade/${request.farmId}`,
    {
      method: "POST",
      //mode: "no-cors",
      headers: {
        "content-type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${request.token}`,
        accept: "application/json",
      },
      body: JSON.stringify({
        slotId: request.slotId,
        item: request.draft.resourceName,
        sfl: toWei(String(request.draft.sfl)),
        amount: toWei(
          String(request.draft.resourceAmount),
          getItemUnit(request.draft.resourceName)
        ),
      }),
    }
  );

  if (response.status === 429) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }

  if (response.status !== 200 || !response.ok) {
    throw new Error("Could not post the listing");
  }

  const data = await response.json();

  return data;
}

export async function list(request: Request) {
  const response = await listRequest(request);

  await wallet
    .getSessionManager()
    .listTrade({ ...response.payload, signature: response.signature });
}
