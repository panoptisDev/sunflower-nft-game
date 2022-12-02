import Web3 from "web3";
import { toWei } from "web3-utils";
import {
  encodeMintFunction,
  encodeSyncFunction,
  MintArgs,
  SyncArgs,
} from "../src/signatures";
import { deploySFLContracts, gasLimit, TestAccount } from "./test-support";

describe("Session contract", () => {
  function increaseTime(web3: any, seconds: number) {
    const id = Date.now();
    return new Promise((resolve, reject) => {
      web3.currentProvider.send(
        {
          jsonrpc: "2.0",
          method: "evm_increaseTime",
          params: [seconds],
          id: id,
        },
        (err1) => {
          if (err1) return reject(err1);

          web3.currentProvider.send(
            {
              jsonrpc: "2.0",
              method: "evm_mine",
              id: id + 1,
            },
            (err2, res) => {
              return err2 ? reject(err2) : resolve(res);
            }
          );
        }
      );
    });
  }

  async function mintSign(web3: Web3, args: MintArgs) {
    const sha = encodeMintFunction(args);
    const { signature } = await web3.eth.accounts.sign(
      sha,
      TestAccount.TEAM.privateKey
    );

    return signature;
  }

  describe("sync", () => {
    const validDeadline = 10000000000000;
    const fee = toWei("0.1");

    it("requires the transaction is submitted before the deadline", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      const sessionId = web3.utils.keccak256("0");

      // 10 seconds to late :(
      const deadline = Math.floor(Date.now() / 1000 - 10);

      const signature = await sign(web3, {
        sessionId,
        deadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [],
        burnAmounts: [],
        tokens: 10,
      });

      const result = session.methods
        .sync(signature, sessionId, deadline, 1, [], [], [], [], -10)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Deadline Passed");
    });

    it("requires the session ID matches", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { farm, session } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = web3.utils.keccak256("randomID");

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [],
        burnAmounts: [],
        tokens: 10,
      });

      const result = session.methods
        .sync(signature, sessionId, validDeadline, 1, [], [], [], [], 10)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Session has changed");
    });

    it("requires the sender owns the farm", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      // Mint it to the team address (not the player)
      await farm.methods.mint(TestAccount.TEAM.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [],
        burnAmounts: [],
        tokens: 10,
      });

      const result = session.methods
        .sync(signature, sessionId, validDeadline, 1, [], [], [], [], 10)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: You do not own this farm");
    });

    it("mints items for a farm", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, inventory, token } = await deploySFLContracts(
        web3
      );

      await session.methods.setMaxItemAmounts([101], [toWei("400")]).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      let tokenBalance = await token.methods
        .balanceOf(farmNFT.account)
        .call({ from: TestAccount.PLAYER.address });

      expect(tokenBalance).toEqual("0");

      let inventoryBalance = await inventory.methods
        .balanceOf(farmNFT.account, 1)
        .call({ from: TestAccount.PLAYER.address });

      expect(inventoryBalance).toEqual("0");

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [101],
        mintAmounts: [toWei("300")],
        burnIds: [],
        burnAmounts: [],
        tokens: toWei("60"),
      });

      await session.methods
        .sync(
          signature,
          sessionId,
          validDeadline,
          1,
          [101],
          [toWei("300")],
          [],
          [],
          toWei("60")
        )
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      tokenBalance = await token.methods
        .balanceOf(farmNFT.account)
        .call({ from: TestAccount.PLAYER.address });

      expect(tokenBalance).toEqual(toWei("60"));

      inventoryBalance = await inventory.methods
        .balanceOf(farmNFT.account, 101)
        .call({ from: TestAccount.PLAYER.address });

      expect(inventoryBalance).toEqual(toWei("300"));
    });

    it("requires the mint IDs are in the signature", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [],
        burnAmounts: [],
        // Only 10 tokens
        tokens: 10,
      });

      const result = session.methods
        .sync(
          signature,
          sessionId,
          validDeadline,
          1,
          [],
          [],
          [],
          [],
          // Something dodgy!
          65000000000000
        )
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Unauthorised");
    });

    it("burns items for a farm", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, inventory, token } = await deploySFLContracts(
        web3
      );

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      // Mint some items
      await token.methods.gameMint(farmNFT.account, 200).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await inventory.methods
        .gameMint(farmNFT.account, [1], [500], web3.utils.keccak256("randomID"))
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [1],
        burnAmounts: [300],
        tokens: -50,
      });

      await session.methods
        .sync(signature, sessionId, validDeadline, 1, [], [], [1], [300], -50)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      const tokenBalance = await token.methods
        .balanceOf(farmNFT.account)
        .call({ from: TestAccount.PLAYER.address });

      expect(tokenBalance).toEqual("150");

      const inventoryBalance = await inventory.methods
        .balanceOf(farmNFT.account, 1)
        .call({ from: TestAccount.PLAYER.address });

      expect(inventoryBalance).toEqual("200");
    });

    it("requires the burn IDs are in the signature", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [1],
        burnAmounts: [20000000],
        tokens: 0,
      });

      const result = session.methods
        .sync(
          signature,
          sessionId,
          validDeadline,
          1,
          [],
          [],
          [1],
          // Something dodgy!
          [5],
          0
        )
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Unauthorised");
    });

    it("requires a new session ID", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, inventory, token } = await deploySFLContracts(
        web3
      );

      await session.methods.setMaxItemAmounts([101], [toWei("400")]).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [101],
        mintAmounts: [500],
        burnIds: [],
        burnAmounts: [],
        tokens: 60,
      });

      await session.methods
        .sync(signature, sessionId, validDeadline, 1, [101], [500], [], [], 60)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      // Avoid throttled method
      await increaseTime(web3, 60 + 1);

      // Try again with same session ID
      const result = session.methods
        .sync(signature, sessionId, validDeadline, 1, [101], [200], [], [], 99)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Session has changed");

      const newSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const newSignature = await sign(web3, {
        sessionId: newSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [101],
        mintAmounts: [500],
        burnIds: [],
        burnAmounts: [],
        tokens: 60,
      });

      await session.methods
        .sync(
          newSignature,
          newSessionId,
          validDeadline,
          1,
          [101],
          [500],
          [],
          [],
          60
        )
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      const tokenBalance = await token.methods
        .balanceOf(farmNFT.account)
        .call({ from: TestAccount.PLAYER.address });

      expect(tokenBalance).toEqual("120");
    });

    it("requires a sufficient fee", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      // Used to check the fee works
      const teamBalance = await web3.eth.getBalance(TestAccount.TEAM.address);

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [1],
        mintAmounts: [500],
        burnIds: [],
        burnAmounts: [],
        tokens: 60,
      });

      const result = session.methods
        .sync(signature, sessionId, validDeadline, 1, [1], [500], [], [], 60)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: toWei("0.09"),
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Missing fee");
    });

    it("takes the fee", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await session.methods.setMaxItemAmounts([101], [toWei("400")]).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [101],
        mintAmounts: [500],
        burnIds: [],
        burnAmounts: [],
        tokens: 60,
      });

      // Used to check the fee works
      const teamBalance = await web3.eth.getBalance(TestAccount.TEAM.address);

      await session.methods
        .sync(signature, sessionId, validDeadline, 1, [101], [500], [], [], 60)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      // Expect the fee to be taken
      const newTeamBalance = await web3.eth.getBalance(
        TestAccount.TEAM.address
      );

      expect(Number(newTeamBalance)).toEqual(Number(teamBalance) + Number(fee));
    });

    it("throttles the sync method", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [],
        burnAmounts: [],
        tokens: 0,
      });

      await session.methods
        .sync(signature, sessionId, validDeadline, 1, [], [], [], [], 0)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      const result = session.methods
        .sync(signature, sessionId, validDeadline, 1, [], [], [], [], 0)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Too many requests");
    });

    it("does not sync more SFL than possible in a session", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [],
        burnAmounts: [],
        tokens: toWei("200"),
      });

      const result = session.methods
        .sync(
          signature,
          sessionId,
          validDeadline,
          1,
          [],
          [],
          [],
          [],
          toWei("200")
        )
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: SFL Exceeds max mint amount");
    });

    it("does not sync rare items", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        // NFT ID
        mintIds: [501],
        mintAmounts: [1],
        burnIds: [],
        burnAmounts: [],
        tokens: 0,
      });

      const result = session.methods
        .sync(signature, sessionId, validDeadline, 1, [501], [1], [], [], 0)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Item mint exceeds max mint amount");
    });

    it("does not sync more resources than possible", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await session.methods
        .setMaxItemAmounts([101, 102], [toWei("400"), toWei("300")])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [101, 102],
        mintAmounts: [toWei("100"), toWei("1000")],
        burnIds: [],
        burnAmounts: [],
        tokens: 60,
      });

      const result = session.methods
        .sync(
          signature,
          sessionId,
          validDeadline,
          1,
          [101, 102],
          [toWei("100"), toWei("1000")],
          [],
          [],
          60
        )
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Item mint exceeds max mint amount");
    });

    it("does not mint more SFL than the allowance allows", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await session.methods.setMintAllowance(toWei("150")).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await sign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [],
        burnAmounts: [],
        tokens: toWei("100"),
      });

      await session.methods
        .sync(
          signature,
          sessionId,
          validDeadline,
          1,
          [],
          [],
          [],
          [],
          toWei("100")
        )
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      // Avoid throttled method
      await increaseTime(web3, 60 + 1);

      const newSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature2 = await sign(web3, {
        sessionId: newSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintIds: [],
        mintAmounts: [],
        burnIds: [],
        burnAmounts: [],
        tokens: toWei("100"),
      });

      const result = session.methods
        .sync(
          signature2,
          newSessionId,
          validDeadline,
          1,
          [],
          [],
          [],
          [],
          toWei("100")
        )
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Session allowance exceeded");
    });

    async function sign(web3: Web3, args: SyncArgs) {
      const sha = encodeSyncFunction({
        ...args,
      });
      const { signature } = await web3.eth.accounts.sign(
        sha,
        TestAccount.TEAM.privateKey
      );

      return signature;
    }
  });

  describe("withdraw", () => {
    const validDeadline = 10000000000000;

    it("requires the transaction is submitted before the deadline", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      const sessionId = web3.utils.keccak256("0");

      // 10 seconds to late :(
      const deadline = Math.floor(Date.now() / 1000 - 10);

      const signature = await withdrawSign(web3, {
        sessionId,
        deadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        ids: [],
        amounts: [],
        sfl: 10,
        tax: 50,
      });

      const result = session.methods
        .withdraw(signature, sessionId, deadline, 1, [], [], 10, 50)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Deadline Passed");
    });

    it("requires the session ID matches", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { farm, session } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = web3.utils.keccak256("randomID");

      const signature = await withdrawSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        ids: [],
        amounts: [],
        sfl: 10,
        tax: 50,
      });

      const result = session.methods
        .withdraw(signature, sessionId, validDeadline, 1, [], [], 10, 50)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Session has changed");
    });

    it("requires the sender owns the farm", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      // Mint it to the team address (not the player)
      await farm.methods.mint(TestAccount.TEAM.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await withdrawSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        ids: [],
        amounts: [],
        sfl: 10,
        tax: 50,
      });

      const result = session.methods
        .withdraw(signature, sessionId, validDeadline, 1, [], [], 10, 50)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: You do not own this farm");
    });

    it("withdraws items for a farm", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, inventory, token } = await deploySFLContracts(
        web3
      );

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      // Mint some items to the farm address
      await token.methods.gameMint(farmNFT.account, 100).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await inventory.methods
        .gameMint(farmNFT.account, [1], [700], web3.utils.keccak256("randomID"))
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const tax = 50;
      const sfl = 60;
      const signature = await withdrawSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        ids: [1],
        amounts: [500],
        sfl,
        tax,
      });

      await session.methods
        .withdraw(signature, sessionId, validDeadline, 1, [1], [500], sfl, tax)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      // Farm tokens are subtracted
      const farmTokens = await token.methods
        .balanceOf(farmNFT.account)
        .call({ from: TestAccount.PLAYER.address });
      expect(farmTokens).toEqual("40");

      // Farm inventory is subtracted
      const farmInventory = await inventory.methods
        .balanceOf(farmNFT.account, 1)
        .call({ from: TestAccount.PLAYER.address });
      expect(farmInventory).toEqual("200");

      // Expect player to only have the taxed amount
      const amount = sfl * (1 - tax / 1000);

      // Player tokens are increased
      const playerTokens = await token.methods
        .balanceOf(TestAccount.PLAYER.address)
        .call({ from: TestAccount.PLAYER.address });
      expect(playerTokens).toEqual(amount.toString());

      // Player inventory is increased
      const playerInventory = await inventory.methods
        .balanceOf(TestAccount.PLAYER.address, [1])
        .call({ from: TestAccount.PLAYER.address });
      expect(playerInventory).toEqual("500");
    });

    it("requires the tax is in the signature", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await withdrawSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        ids: [],
        amounts: [],
        sfl: 10,
        tax: 10,
      });

      const result = session.methods
        .withdraw(signature, sessionId, validDeadline, 1, [], [], 10, 0)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Unauthorised");
    });

    it("requires a new the session ID", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, inventory, token } = await deploySFLContracts(
        web3
      );

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      await token.methods.gameMint(farmNFT.account, 10000).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await withdrawSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        ids: [],
        amounts: [],
        sfl: 60,
        tax: 50,
      });

      await session.methods
        .withdraw(signature, sessionId, validDeadline, 1, [], [], 60, 50)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      // Avoid throttled method
      await increaseTime(web3, 60 + 1);

      // Try again with same session ID
      const result = session.methods
        .withdraw(signature, sessionId, validDeadline, 1, [], [], 60, 50)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Session has changed");

      const newSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const newSignature = await withdrawSign(web3, {
        sessionId: newSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        ids: [],
        amounts: [],
        sfl: 60,
        tax: 50,
      });

      await session.methods
        .withdraw(newSignature, newSessionId, validDeadline, 1, [], [], 60, 50)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const tokenBalance = await token.methods
        .balanceOf(farmNFT.account)
        .call({ from: TestAccount.PLAYER.address });

      expect(tokenBalance).toEqual("9880");
    });

    it("takes the SFL tax", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, token, wishingWell } = await deploySFLContracts(
        web3
      );

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      const sfl = 600000;

      // Mint some items
      await token.methods.gameMint(farmNFT.account, sfl).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const tax = 50;
      const signature = await withdrawSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        ids: [],
        amounts: [],
        sfl,
        tax,
      });

      await session.methods
        .withdraw(signature, sessionId, validDeadline, 1, [], [], sfl, tax)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      // Expect player to only have the taxed amount
      const totalTax = sfl * (tax / 1000);
      const teamAmount = totalTax * 0.7;
      const wishingWellAmount = totalTax * 0.3;

      const teamBalance = await token.methods
        .balanceOf(TestAccount.TEAM.address)
        .call({ from: TestAccount.PLAYER.address });

      expect(teamBalance).toEqual(teamAmount.toString());

      const wishingWellBalance = await token.methods
        .balanceOf(wishingWell.options.address)
        .call({ from: TestAccount.PLAYER.address });

      expect(wishingWellBalance).toEqual(wishingWellAmount.toString());
    });

    it("withdraws multiple times", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, token, wishingWell } = await deploySFLContracts(
        web3
      );

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      const sfl = 600000;

      // Mint some items
      await token.methods.gameMint(farmNFT.account, sfl).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const tax = 50;
      const signature = await withdrawSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        ids: [],
        amounts: [],
        sfl,
        tax,
      });

      await session.methods
        .withdraw(signature, sessionId, validDeadline, 1, [], [], sfl, tax)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      // Expect player to only have the taxed amount
      const totalTax = sfl * (tax / 1000);
      const teamAmount = totalTax * 0.7;
      const wishingWellAmount = totalTax * 0.3;

      const teamBalance = await token.methods
        .balanceOf(TestAccount.TEAM.address)
        .call({ from: TestAccount.PLAYER.address });

      expect(teamBalance).toEqual(teamAmount.toString());

      const wishingWellBalance = await token.methods
        .balanceOf(wishingWell.options.address)
        .call({ from: TestAccount.PLAYER.address });

      expect(wishingWellBalance).toEqual(wishingWellAmount.toString());
    });

    it("prevents withdraw when in cooldown", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, inventory } = await deploySFLContracts(web3);

      const id = 401;

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      // Free recipe
      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: id,
            ingredientIds: [],
            ingredientAmounts: [],
            maxSupply: 100,
            // 2 minute wait before trying to withdraw
            cooldownSeconds: 120,
            tokenAmount: 0,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      const mintSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      // Mint an item, then try withdraw
      const mintSignature = await mintSign(web3, {
        sessionId: mintSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: farmNFT.tokenId,
        mintId: id,
      });

      await session.methods
        .mint(mintSignature, mintSessionId, validDeadline, farmNFT.tokenId, id)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: toWei("0.1"),
        });

      // Go past the throttle
      await increaseTime(web3, 60);

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const tax = 50;
      const withdrawSignature = await withdrawSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        ids: [id],
        amounts: [1],
        sfl: 0,
        tax,
      });

      const result = session.methods
        .withdraw(
          withdrawSignature,
          sessionId,
          validDeadline,
          1,
          [id],
          [1],
          0,
          tax
        )
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Cooldown period has not elapsed");

      // Wait the remaining cooldown time
      await increaseTime(web3, 70);

      await session.methods
        .withdraw(
          withdrawSignature,
          sessionId,
          validDeadline,
          1,
          [id],
          [1],
          0,
          tax
        )
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const playerInventory = await inventory.methods
        .balanceOf(TestAccount.PLAYER.address, id)
        .call({ from: TestAccount.PLAYER.address });
      expect(playerInventory).toEqual("1");
    });

    type SyncArgs = {
      sessionId: string;
      deadline: number;
      sender: string;
      farmId: number;
      ids: number[];
      amounts: number[];
      sfl: number;
      tax: number;
    };

    function encodeWithdrawFunction(
      web3: Web3,
      { sessionId, deadline, sender, farmId, ids, amounts, sfl, tax }: SyncArgs
    ) {
      return web3.utils.keccak256(
        web3.eth.abi.encodeParameters(
          [
            "bytes32",
            "uint256",
            "address",
            "uint256",
            "uint256[]",
            "uint256[]",
            "uint256",
            "uint256",
          ],
          [
            sessionId,
            deadline.toString(),
            sender,
            farmId.toString(),
            ids as any,
            amounts as any,
            sfl as any,
            tax as any,
          ]
        )
      );
    }

    async function withdrawSign(web3: Web3, args: SyncArgs) {
      const sha = encodeWithdrawFunction(web3, args);
      const { signature } = await web3.eth.accounts.sign(
        sha,
        TestAccount.TEAM.privateKey
      );

      return signature;
    }
  });

  describe("mint", () => {
    const validDeadline = 10000000000000;
    const fee = toWei("0.1");
    const insufficientFee = toWei("0.05");

    it("reverts if the signature is invalid", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { farm, session } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = `0x${"0".repeat(130)}`;

      const result = session.methods
        .mint(signature, sessionId, validDeadline, 1, 0)
        .send({ from: TestAccount.PLAYER.address, value: fee });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("revert ECDSA");
    });

    it("reverts if the signature is valid but doesn't match", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { farm, session } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 888,
        mintId: 888,
      });

      const result = session.methods
        .mint(signature, sessionId, validDeadline, 1, 0)
        .send({ from: TestAccount.PLAYER.address, value: fee });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Unauthorised");
    });

    it("reverts if the signature was already used", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      // Free recipe
      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 1,
            ingredientIds: [],
            ingredientAmounts: [],
            maxSupply: 1000,
            cooldownSeconds: 60,
            tokenAmount: 0,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintId: 1,
      });

      await session.methods
        .mint(signature, sessionId, validDeadline, 1, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await increaseTime(web3, 60 + 1);

      const result = session.methods
        .mint(signature, sessionId, validDeadline, 1, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Session has changed");
    });

    it("reverts if fee is insufficient", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, inventory } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      await inventory.methods
        .gameMint(
          farmNFT.account,
          [1, 2],
          [100, 80],
          web3.utils.keccak256("randomID")
        )
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 6,
            ingredientIds: [1, 2],
            ingredientAmounts: [60, 70],
            maxSupply: 1000,
            cooldownSeconds: 60,
            tokenAmount: 0,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const sessionId = await session.methods
        .getSessionId(farmNFT.tokenId)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: farmNFT.tokenId,
        mintId: 6,
      });

      const result = session.methods
        .mint(signature, sessionId, validDeadline, farmNFT.tokenId, 6)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: insufficientFee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Missing fee");
    });

    it("reverts if the deadline has passed", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const deadline = Math.floor(Date.now() / 1000 - 10);

      const signature = await mintSign(web3, {
        sessionId,
        deadline,
        sender: TestAccount.PLAYER.address,
        farmId: 0,
        mintId: 1,
      });

      const result = session.methods
        .mint(signature, sessionId, deadline, 0, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Deadline Passed");
    });

    it("reverts if the sender doesn't match", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { farm, session } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.TEAM.address,
        farmId: 1,
        mintId: 1,
      });

      const result = session.methods
        .mint(signature, sessionId, validDeadline, 1, 1)
        .send({ from: TestAccount.PLAYER.address, value: fee });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Unauthorised");
    });

    it("reverts if the sender doesn't own the farm", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.TEAM.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintId: 0,
      });

      const result = session.methods
        .mint(signature, sessionId, validDeadline, 1, 0)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: You do not own this farm");
    });

    it("reverts if the farm doesn't exist", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 999999999,
        mintId: 0,
      });

      const result = session.methods
        .mint(signature, sessionId, validDeadline, 999999999, 0)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("ERC721: owner query for nonexistent token");
    });

    it("reverts if the recipe doesn't exist", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintId: 999999,
      });

      const result = session.methods
        .mint(signature, sessionId, validDeadline, 1, 999999)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: The recipe is not ready");
    });

    it("reverts if recipe ingredients cannot be afforded", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 1,
            ingredientIds: [1, 2],
            ingredientAmounts: [1, 2],
            maxSupply: 1000,
            cooldownSeconds: 60,
            tokenAmount: 0,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintId: 1,
      });

      const result = session.methods
        .mint(signature, sessionId, validDeadline, 1, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      // ERC1155: burn amount exceeds balance
      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("revert");
    });

    it("reverts if recipe tokens cannot be afforded", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 1,
            ingredientIds: [],
            ingredientAmounts: [],
            maxSupply: 1000,
            cooldownSeconds: 60,
            tokenAmount: 1000,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintId: 1,
      });

      const result = session.methods
        .mint(signature, sessionId, validDeadline, 1, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      // ERC1155: burn amount exceeds balance
      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("ERC20: transfer amount exceeds balance");
    });

    it("removes the ingredient from the inventory and adds the item", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, inventory } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      await inventory.methods
        .gameMint(
          farmNFT.account,
          [1, 2],
          [100, 80],
          web3.utils.keccak256("randomID")
        )
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 6,
            ingredientIds: [1, 2],
            ingredientAmounts: [60, 70],
            maxSupply: 1000,
            cooldownSeconds: 60,
            tokenAmount: 0,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const sessionId = await session.methods
        .getSessionId(farmNFT.tokenId)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: farmNFT.tokenId,
        mintId: 6,
      });

      await session.methods
        .mint(signature, sessionId, validDeadline, farmNFT.tokenId, 6)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      const result = await inventory.methods
        .balanceOfBatch(
          [farmNFT.account, farmNFT.account, farmNFT.account],
          [1, 2, 6]
        )
        .call();

      expect(result[0]).toBe("40");
      expect(result[1]).toBe("10");
      expect(result[2]).toBe("1");
    });

    it("rotates the session", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      // Free recipe
      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 1,
            ingredientIds: [],
            ingredientAmounts: [],
            maxSupply: 1000,
            cooldownSeconds: 60,
            tokenAmount: 0,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const sessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: 1,
        mintId: 1,
      });

      await session.methods
        .mint(signature, sessionId, validDeadline, 1, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      const newSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      expect(sessionId).not.toBe(newSessionId);
    });

    it("prevents minting when max supply is reached", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      // Free recipe
      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 1,
            ingredientIds: [],
            ingredientAmounts: [],
            maxSupply: 1,
            cooldownSeconds: 600,
            tokenAmount: 0,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const firstSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const firstSignature = await mintSign(web3, {
        sessionId: firstSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: farmNFT.tokenId,
        mintId: 1,
      });

      await session.methods
        .mint(firstSignature, firstSessionId, validDeadline, farmNFT.tokenId, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      // Avoid throttled method
      await increaseTime(web3, 60 + 1);

      const secondSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId: secondSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: farmNFT.tokenId,
        mintId: 1,
      });

      const result = session.methods
        .mint(signature, secondSessionId, validDeadline, farmNFT.tokenId, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Max supply reached");
    });

    it("allows minting multiple when cooldown is zero", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, inventory } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      // Free recipe
      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 1,
            ingredientIds: [],
            ingredientAmounts: [],
            maxSupply: 100,
            cooldownSeconds: 0,
            tokenAmount: 0,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const firstSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const firstSignature = await mintSign(web3, {
        sessionId: firstSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: farmNFT.tokenId,
        mintId: 1,
      });

      await session.methods
        .mint(firstSignature, firstSessionId, validDeadline, farmNFT.tokenId, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      // Avoid throttled method
      await increaseTime(web3, 60 + 1);

      const secondSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId: secondSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: farmNFT.tokenId,
        mintId: 1,
      });

      await session.methods
        .mint(signature, secondSessionId, validDeadline, farmNFT.tokenId, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      const result = await inventory.methods
        .balanceOf(farmNFT.account, 1)
        .call();

      expect(result).toBe("2");
    });

    it("prevents minting if a recipe is disabled", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, inventory } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      // Free recipe
      await session.methods
        .addRecipeBatch([
          {
            enabled: false,
            mintId: 1,
            ingredientIds: [],
            ingredientAmounts: [],
            maxSupply: 100,
            cooldownSeconds: 0,
            tokenAmount: 0,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const firstSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const firstSignature = await mintSign(web3, {
        sessionId: firstSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: farmNFT.tokenId,
        mintId: 1,
      });

      const result = session.methods
        .mint(firstSignature, firstSessionId, validDeadline, farmNFT.tokenId, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: The recipe is not ready");
    });

    it("prevents minting when in cooldown", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, inventory } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      // Free recipe
      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 1,
            ingredientIds: [],
            ingredientAmounts: [],
            maxSupply: 100,
            cooldownSeconds: 120,
            tokenAmount: 0,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const firstSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const firstSignature = await mintSign(web3, {
        sessionId: firstSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: farmNFT.tokenId,
        mintId: 1,
      });

      await session.methods
        .mint(firstSignature, firstSessionId, validDeadline, farmNFT.tokenId, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      // Avoid throttled method
      await increaseTime(web3, 60 + 1);

      const secondSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId: secondSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: farmNFT.tokenId,
        mintId: 1,
      });

      const result = session.methods
        .mint(signature, secondSessionId, validDeadline, farmNFT.tokenId, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Cooldown period has not elapsed");
    });

    it("allows minting when cooldown has elapsed", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session, farm, inventory } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const farmNFT = await farm.methods
        .getFarm(1)
        .call({ from: TestAccount.PLAYER.address });

      // Free recipe
      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 1,
            ingredientIds: [],
            ingredientAmounts: [],
            maxSupply: 100,
            cooldownSeconds: 30,
            tokenAmount: 0,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const firstSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const firstSignature = await mintSign(web3, {
        sessionId: firstSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: farmNFT.tokenId,
        mintId: 1,
      });

      await session.methods
        .mint(firstSignature, firstSessionId, validDeadline, farmNFT.tokenId, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      // Avoid throttled method
      await increaseTime(web3, 60 + 1);

      const secondSessionId = await session.methods
        .getSessionId(1)
        .call({ from: TestAccount.PLAYER.address });

      const signature = await mintSign(web3, {
        sessionId: secondSessionId,
        deadline: validDeadline,
        sender: TestAccount.PLAYER.address,
        farmId: farmNFT.tokenId,
        mintId: 1,
      });

      await session.methods
        .mint(signature, secondSessionId, validDeadline, farmNFT.tokenId, 1)
        .send({
          from: TestAccount.PLAYER.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
          value: fee,
        });

      const result = await inventory.methods
        .balanceOf(farmNFT.account, 1)
        .call();

      expect(result).toBe("2");
    });
  });

  describe("addRecipeBatch", () => {
    it("prevents the public adding recipes", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      const result = session.methods.addRecipeBatch([]).call({
        from: TestAccount.PLAYER.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLandGame: You are not the game");
    });

    it("allows the game to add an empty array", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      await session.methods.addRecipeBatch([]).call({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });
    });

    it("allows the game to add multiple recipes", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 1,
            ingredientIds: [1],
            ingredientAmounts: [1],
            maxSupply: 100,
            cooldownSeconds: 30,
            tokenAmount: 100,
          },
          {
            mintId: 2,
            ingredientIds: [2],
            ingredientAmounts: [2],
            maxSupply: 100,
            cooldownSeconds: 30,
            tokenAmount: 100,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const recipe1 = await session.methods
        .getRecipe(1)
        .call({ from: TestAccount.PLAYER.address });

      expect(recipe1.mintId).toBe("1");
      expect(recipe1.ingredientIds.length).toBe(1);
      expect(recipe1.ingredientAmounts.length).toBe(1);
      expect(recipe1.ingredientIds[0]).toBe("1");
      expect(recipe1.ingredientAmounts[0]).toBe("1");

      const recipe2 = await session.methods
        .getRecipe(2)
        .call({ from: TestAccount.PLAYER.address });

      expect(recipe2.mintId).toBe("2");
      expect(recipe2.ingredientIds.length).toBe(1);
      expect(recipe2.ingredientAmounts.length).toBe(1);
      expect(recipe2.ingredientIds[0]).toBe("2");
      expect(recipe2.ingredientAmounts[0]).toBe("2");
    });

    it("allows the game to override an existing recipe", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 1,
            ingredientIds: [],
            ingredientAmounts: [],
            maxSupply: 100,
            cooldownSeconds: 30,
            tokenAmount: 0,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 1,
            ingredientIds: [1],
            ingredientAmounts: [1],
            maxSupply: 200,
            cooldownSeconds: 30,
            tokenAmount: 100,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const result = await session.methods
        .getRecipe(1)
        .call({ from: TestAccount.PLAYER.address });

      expect(result.mintId).toBe("1");
      expect(result.ingredientIds.length).toBe(1);
      expect(result.ingredientAmounts.length).toBe(1);
      expect(result.ingredientIds[0]).toBe("1");
      expect(result.ingredientAmounts[0]).toBe("1");
      expect(result.maxSupply).toBe("200");
      expect(result.cooldownSeconds).toBe("30");
      expect(result.tokenAmount).toBe("100");
    });

    it("prevents recipe with arrays of different length", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      const result = session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 1,
            ingredientIds: [],
            ingredientAmounts: [],
            maxSupply: 100,
            cooldownSeconds: 30,
            tokenAmount: 0,
          },
          {
            mintId: 2,
            ingredientIds: [1, 2, 3],
            ingredientAmounts: [4],
            maxSupply: 100,
            cooldownSeconds: 30,
            tokenAmount: 0,
          },
        ])
        .call({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLand: Recipe array length mismatch");
    });
  });

  describe("getRecipeBatch", () => {
    it("allows the public to read a nonexistant recipes", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      const result = await session.methods
        .getRecipeBatch([100, 200])
        .call({ from: TestAccount.PLAYER.address });

      expect(result[0].mintId).toBe("0");
      expect(result[1].mintId).toBe("0");
    });

    it("allows the public to read existing recipes", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 100,
            ingredientIds: [],
            ingredientAmounts: [],
            maxSupply: 100,
            cooldownSeconds: 30,
            tokenAmount: 100,
          },
          {
            mintId: 200,
            ingredientIds: [],
            ingredientAmounts: [],
            maxSupply: 100,
            cooldownSeconds: 30,
            tokenAmount: 100,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const result = await session.methods
        .getRecipeBatch([100, 200])
        .call({ from: TestAccount.PLAYER.address });

      expect(result[0].mintId).toBe("100");
      expect(result[0].ingredientIds.length).toBe(0);
      expect(result[0].ingredientAmounts.length).toBe(0);
      expect(result[0].maxSupply).toBe("100");
      expect(result[0].cooldownSeconds).toBe("30");
      expect(result[0].tokenAmount).toBe("100");

      expect(result[1].mintId).toBe("200");
      expect(result[1].ingredientIds.length).toBe(0);
      expect(result[1].ingredientAmounts.length).toBe(0);
      expect(result[1].maxSupply).toBe("100");
      expect(result[1].tokenAmount).toBe("100");
    });
  });

  describe("getRecipe", () => {
    it("allows the public to read a nonexistant recipe", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      const result = await session.methods
        .getRecipe(999999)
        .call({ from: TestAccount.PLAYER.address });

      expect(result.mintId).toBe("0");
    });

    it("allows the public to read a recipe", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 1,
            ingredientIds: [1],
            ingredientAmounts: [1],
            maxSupply: 100,
            cooldownSeconds: 30,
            tokenAmount: 100,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      const result = await session.methods
        .getRecipe(1)
        .call({ from: TestAccount.PLAYER.address });

      expect(result.mintId).toBe("1");
      expect(result.ingredientIds.length).toBe(1);
      expect(result.ingredientAmounts.length).toBe(1);
      expect(result.ingredientIds[0]).toBe("1");
      expect(result.ingredientAmounts[0]).toBe("1");
      expect(result.maxSupply).toBe("100");
      expect(result.cooldownSeconds).toBe("30");
      expect(result.tokenAmount).toBe("100");
    });
  });

  describe("removeRecipeBatch", () => {
    it("prevents public to remove a recipe", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      const result = session.methods.removeRecipeBatch([1]).send({
        from: TestAccount.PLAYER.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLandGame: You are not the game");
    });

    it("allows the game to remove an empty array", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      await session.methods.removeRecipeBatch([]).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });
    });

    it("allows the game to remove multiple exists recipes", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      await session.methods
        .addRecipeBatch([
          {
            enabled: true,
            mintId: 8,
            ingredientIds: [8, 8],
            ingredientAmounts: [8, 8],
            maxSupply: 888,
            cooldownSeconds: 88,
            tokenAmount: 888,
          },
          {
            mintId: 9,
            ingredientIds: [9, 9, 9],
            ingredientAmounts: [9, 9, 9],
            maxSupply: 999,
            cooldownSeconds: 99,
            tokenAmount: 999,
          },
        ])
        .send({
          from: TestAccount.TEAM.address,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gasLimit,
        });

      await session.methods.removeRecipeBatch([8, 9]).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const result = await session.methods
        .getRecipeBatch([8, 9])
        .call({ from: TestAccount.PLAYER.address });

      expect(result[0].mintId).toBe("0");
      expect(result[1].mintId).toBe("0");
    });
  });

  describe("setMintedAtBulk", () => {
    it("reverts if called by the public", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      const result = session.methods.setMintedAtBulk([1], 1, 60).send({
        from: TestAccount.PLAYER.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("SunflowerLandGame: You are not the game");
    });

    it("sets minted at for multiple farms", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      await session.methods.setMintedAtBulk([1, 2], 1, 60).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const result1 = await session.methods.getMintedAtBatch(1, [1]).call({
        from: TestAccount.PLAYER.address,
      });

      expect(result1[0]).toBe("60");

      const result2 = await session.methods.getMintedAtBatch(2, [1]).call({
        from: TestAccount.PLAYER.address,
      });

      expect(result2[0]).toBe("60");
    });
  });

  describe("getMintedAtBatch", () => {
    it("returns zero if farm doesn't exist", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      const result = await session.methods
        .getMintedAtBatch(1, [1])
        .call({ from: TestAccount.PLAYER.address });

      expect(result[0]).toBe("0");
    });

    it("returns empty list when no items specified", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { farm, session } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const result = await session.methods
        .getMintedAtBatch(1, [])
        .call({ from: TestAccount.PLAYER.address });

      expect(result.length).toBe(0);
    });

    it("returns zero when items don't exist", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { farm, session } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const result = await session.methods
        .getMintedAtBatch(1, [1])
        .call({ from: TestAccount.PLAYER.address });

      expect(result.length).toBe(1);
      expect(result[0]).toBe("0");
    });

    it("returns minted at for multiple items", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { farm, session } = await deploySFLContracts(web3);

      await farm.methods.mint(TestAccount.PLAYER.address).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await session.methods.setMintedAtBulk([1], 1, 60).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      const result = await session.methods
        .getMintedAtBatch(1, [1])
        .call({ from: TestAccount.PLAYER.address });

      expect(result.length).toBe(1);
      expect(result[0]).toBe("60");
    });
  });

  describe("setMintFee", () => {
    it("reverts if if called by the public", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      const result = session.methods.setMintFee(60).send({
        from: TestAccount.PLAYER.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

      await expect(
        result.catch((e: Error) => Promise.reject(e.message))
      ).rejects.toContain("Ownable: caller is not the owner");
    });

    it("succeeds if called by the team", async () => {
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
      );
      const { session } = await deploySFLContracts(web3);

      await session.methods.setMintFee(60).send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });
    });
  });
});
