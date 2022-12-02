/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import type {
  Contract,
  Overrides,
  AddTransactionResponse,
  Invocation,
  EstimateFeeResponse,
} from "starknet";
import type { BlockIdentifier } from "starknet/provider/utils";
import type BN from "bn.js";
import type { BigNumberish } from "starknet/utils/number";

export interface ERC20 extends Contract {
  decimals(options?: {
    blockIdentifier?: BlockIdentifier;
  }): Promise<[BN] & { res: BN }>;
  get_total_supply(options?: {
    blockIdentifier?: BlockIdentifier;
  }): Promise<[BN] & { res: BN }>;
  balance_of(
    user: BigNumberish,
    options?: { blockIdentifier?: BlockIdentifier }
  ): Promise<[BN] & { res: BN }>;
  allowance(
    owner: BigNumberish,
    spender: BigNumberish,
    options?: { blockIdentifier?: BlockIdentifier }
  ): Promise<[BN] & { res: BN }>;
  initialize(options?: Overrides): Promise<AddTransactionResponse>;
  mint(
    recipient: BigNumberish,
    amount: BigNumberish,
    options?: Overrides
  ): Promise<AddTransactionResponse>;
  transfer(
    recipient: BigNumberish,
    amount: BigNumberish,
    options?: Overrides
  ): Promise<AddTransactionResponse>;
  transfer_from(
    sender: BigNumberish,
    recipient: BigNumberish,
    amount: BigNumberish,
    options?: Overrides
  ): Promise<AddTransactionResponse>;
  approve(
    spender: BigNumberish,
    amount: BigNumberish,
    options?: Overrides
  ): Promise<AddTransactionResponse>;
  functions: {
    decimals(options?: {
      blockIdentifier?: BlockIdentifier;
    }): Promise<[BN] & { res: BN }>;
    get_total_supply(options?: {
      blockIdentifier?: BlockIdentifier;
    }): Promise<[BN] & { res: BN }>;
    balance_of(
      user: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<[BN] & { res: BN }>;
    allowance(
      owner: BigNumberish,
      spender: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<[BN] & { res: BN }>;
    initialize(options?: Overrides): Promise<AddTransactionResponse>;
    mint(
      recipient: BigNumberish,
      amount: BigNumberish,
      options?: Overrides
    ): Promise<AddTransactionResponse>;
    transfer(
      recipient: BigNumberish,
      amount: BigNumberish,
      options?: Overrides
    ): Promise<AddTransactionResponse>;
    transfer_from(
      sender: BigNumberish,
      recipient: BigNumberish,
      amount: BigNumberish,
      options?: Overrides
    ): Promise<AddTransactionResponse>;
    approve(
      spender: BigNumberish,
      amount: BigNumberish,
      options?: Overrides
    ): Promise<AddTransactionResponse>;
  };
  callStatic: {
    decimals(options?: {
      blockIdentifier?: BlockIdentifier;
    }): Promise<[BN] & { res: BN }>;
    get_total_supply(options?: {
      blockIdentifier?: BlockIdentifier;
    }): Promise<[BN] & { res: BN }>;
    balance_of(
      user: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<[BN] & { res: BN }>;
    allowance(
      owner: BigNumberish,
      spender: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<[BN] & { res: BN }>;
    initialize(options?: {
      blockIdentifier?: BlockIdentifier;
    }): Promise<[] & {}>;
    mint(
      recipient: BigNumberish,
      amount: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<[] & {}>;
    transfer(
      recipient: BigNumberish,
      amount: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<[] & {}>;
    transfer_from(
      sender: BigNumberish,
      recipient: BigNumberish,
      amount: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<[] & {}>;
    approve(
      spender: BigNumberish,
      amount: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<[] & {}>;
  };
  populateTransaction: {
    decimals(options?: { blockIdentifier?: BlockIdentifier }): Invocation;
    get_total_supply(options?: {
      blockIdentifier?: BlockIdentifier;
    }): Invocation;
    balance_of(
      user: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Invocation;
    allowance(
      owner: BigNumberish,
      spender: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Invocation;
    initialize(options?: Overrides): Invocation;
    mint(
      recipient: BigNumberish,
      amount: BigNumberish,
      options?: Overrides
    ): Invocation;
    transfer(
      recipient: BigNumberish,
      amount: BigNumberish,
      options?: Overrides
    ): Invocation;
    transfer_from(
      sender: BigNumberish,
      recipient: BigNumberish,
      amount: BigNumberish,
      options?: Overrides
    ): Invocation;
    approve(
      spender: BigNumberish,
      amount: BigNumberish,
      options?: Overrides
    ): Invocation;
  };
  estimateFee: {
    decimals(options?: {
      blockIdentifier?: BlockIdentifier;
    }): Promise<EstimateFeeResponse>;
    get_total_supply(options?: {
      blockIdentifier?: BlockIdentifier;
    }): Promise<EstimateFeeResponse>;
    balance_of(
      user: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<EstimateFeeResponse>;
    allowance(
      owner: BigNumberish,
      spender: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<EstimateFeeResponse>;
    initialize(options?: {
      blockIdentifier?: BlockIdentifier;
    }): Promise<EstimateFeeResponse>;
    mint(
      recipient: BigNumberish,
      amount: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<EstimateFeeResponse>;
    transfer(
      recipient: BigNumberish,
      amount: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<EstimateFeeResponse>;
    transfer_from(
      sender: BigNumberish,
      recipient: BigNumberish,
      amount: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<EstimateFeeResponse>;
    approve(
      spender: BigNumberish,
      amount: BigNumberish,
      options?: { blockIdentifier?: BlockIdentifier }
    ): Promise<EstimateFeeResponse>;
  };
}