import { useActor } from "@xstate/react";
import React, { useContext, useEffect, useState } from "react";
import Decimal from "decimal.js-light";
import { toWei } from "web3-utils";

import * as AuthProvider from "features/auth/lib/Provider";

import { Context } from "features/game/GoblinProvider";

import { shortAddress } from "lib/utils/shortAddress";

import { Button } from "components/ui/Button";

import { wallet } from "lib/blockchain/wallet";

import token from "assets/icons/token_2.png";
import player from "assets/icons/player.png";
import upArrow from "assets/icons/arrow_up.png";
import downArrow from "assets/icons/arrow_down.png";
import lightning from "assets/icons/lightning.png";

import { getTax } from "lib/utils/tax";

interface Props {
  onWithdraw: (sfl: string) => void;
}
export const WithdrawTokens: React.FC<Props> = ({ onWithdraw }) => {
  const { authService } = useContext(AuthProvider.Context);
  const [authState] = useActor(authService);

  const { goblinService } = useContext(Context);
  const [
    {
      context: { state },
    },
  ] = useActor(goblinService);

  const [amount, setAmount] = useState<Decimal>(new Decimal(0));
  const [tax, setTax] = useState(0);

  const balance = state.balance;

  useEffect(() => {
    // Use base 1000
    const _tax =
      getTax(
        typeof amount !== "string" ? amount : new Decimal(0),
        state.inventory
      ) / 10;

    setTax(_tax);
  }, [amount, state.inventory]);

  // In order to be able to type into the input box amount needs to be able to be a string
  // for when the user deletes the 0. safeAmount is a getter that will return amount as a Decimal
  const safeAmount = (value: Decimal | string): Decimal => {
    return typeof value !== "string" ? value : new Decimal(0);
  };

  const withdraw = () => {
    if (amount > new Decimal(0)) {
      onWithdraw(toWei(amount.toString()));
    } else {
      setAmount(new Decimal(0));
    }
  };

  const onWithdrawChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      setAmount(new Decimal(0));
    } else {
      setAmount(new Decimal(Number(e.target.value)));
    }
  };

  const setMax = () => {
    if (balance.gte(0.01)) setAmount(balance.minus(new Decimal(0.01)));
  };

  const incrementWithdraw = () => {
    if (
      safeAmount(amount).plus(0.1).toNumber() <
      balance.toDecimalPlaces(2, 1).toNumber()
    )
      setAmount((prevState) => safeAmount(prevState).plus(0.1));
  };

  const decrementWithdraw = () => {
    if (safeAmount(amount).toNumber() > 0.01) {
      if (safeAmount(amount).minus(0.1).toNumber() >= 0)
        setAmount((prevState) => safeAmount(prevState).minus(0.1));
    }
  };

  const enabled = authState.context.token?.userAccess.withdraw;
  const disableWithdraw =
    safeAmount(amount).gte(balance) || safeAmount(amount).lt(0);

  if (!enabled) {
    return <span>Available May 9th</span>;
  }

  return (
    <>
      <div className="flex flex-wrap mt-3">
        <span className="mb-3 text-base">Choose amount to withdraw</span>
      </div>
      <span className="text-sm">
        {balance.toFixed(2)}SFL is available on-chain
      </span>

      <div className="h-16">
        <div className="flex items-center mt-2">
          <div className="relative mr-4">
            <input
              type="number"
              className="text-shadow shadow-inner shadow-black bg-brown-200 w-32 p-2 text-center"
              step="0.1"
              min={0}
              value={
                typeof amount === "string"
                  ? ""
                  : amount.toDecimalPlaces(2, Decimal.ROUND_DOWN).toNumber()
              }
              onChange={onWithdrawChange}
            />
            <img
              src={upArrow}
              alt="increment donation value"
              className="cursor-pointer w-3 absolute -right-4 top-0"
              onClick={incrementWithdraw}
            />
            <img
              src={downArrow}
              alt="decrement donation value"
              className="cursor-pointer w-3 absolute -right-4 bottom-0"
              onClick={decrementWithdraw}
            />
          </div>
          <Button className="w-24 ml-6" onClick={setMax}>
            Max
          </Button>
        </div>
        {amount.gt(0) && (
          <>
            <span className="text-xs inline-flex align-items-center">
              {state.inventory["Liquidity Provider"] && (
                <img src={lightning} className="h-6" />
              )}
              <span className="text-xs">{tax}% fee</span>
              <a
                className="underline ml-2"
                href="https://docs.sunflower-land.com/fundamentals/withdrawing"
                target="_blank"
                rel="noreferrer"
              >
                (Read more)
              </a>
            </span>
          </>
        )}
      </div>

      <div className="flex items-center mt-3">
        <span className="">
          {`You will receive: ${safeAmount(amount)
            .mul((100 - tax) / 100)
            .toFixed(3)}`}
        </span>
        <img src={token} className="w-4 ml-2 img-highlight" />
      </div>

      <div className="flex items-center mt-2 mb-2">
        <img src={player} className="h-8 mr-2" />
        <div>
          <p className="text-sm">Sent to your wallet</p>
          <p className="text-sm">{shortAddress(wallet.myAccount || "XXXX")}</p>
        </div>
      </div>
      <Button onClick={withdraw} disabled={disableWithdraw}>
        Withdraw
      </Button>
    </>
  );
};
