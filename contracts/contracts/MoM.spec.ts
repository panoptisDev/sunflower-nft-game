import Web3 from "web3";
import { TestAccount, deployMoMContracts, gasLimit } from "./test-support";

describe("Million on Mars contract", () => {
  it("deploys with total supply zero", async function () {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { millionOnMarsNFT } = await deployMoMContracts(web3);

    expect(
      await millionOnMarsNFT.methods
        .totalSupply()
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("0");
  });

  it("does not let users mint an item", async function () {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { millionOnMarsNFT } = await deployMoMContracts(web3);

    const result = millionOnMarsNFT.methods.mint([]).send({
      from: TestAccount.TEAM.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("SunflowerLandGame: You are not the game");
  });

  it("lets MoM mint NFTs", async function () {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { millionOnMarsNFT } = await deployMoMContracts(web3);

    await millionOnMarsNFT.methods
      .addGameRole(TestAccount.TEAM.address)
      .send({ from: TestAccount.TEAM.address });

    await millionOnMarsNFT.methods
      .mint(["0xE9c52F005c5c2dE19C71eD2Bad7482cf92043F74"])
      .send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

    expect(
      await millionOnMarsNFT.methods
        .balanceOf("0xE9c52F005c5c2dE19C71eD2Bad7482cf92043F74")
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("1");

    expect(
      await millionOnMarsNFT.methods
        .totalSupply()
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("1");
  });

  it("mints multiple NFTs", async function () {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { millionOnMarsNFT } = await deployMoMContracts(web3);

    await millionOnMarsNFT.methods.addGameRole(TestAccount.TEAM.address).send({
      from: TestAccount.TEAM.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await millionOnMarsNFT.methods
      .mint([
        "0xE9c52F005c5c2dE19C71eD2Bad7482cf92043F74",
        "0x5001FD9F7EcF5aC206F499fB93b6728Dca319165",
      ])
      .send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

    expect(
      await millionOnMarsNFT.methods
        .balanceOf("0xE9c52F005c5c2dE19C71eD2Bad7482cf92043F74")
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("1");

    expect(
      await millionOnMarsNFT.methods
        .balanceOf("0x5001FD9F7EcF5aC206F499fB93b6728Dca319165")
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("1");

    expect(
      await millionOnMarsNFT.methods
        .totalSupply()
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("2");
  });

  it.skip("does not let user trade MoM NFT directly", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { millionOnMarsNFT } = await deployMoMContracts(web3);

    const result = millionOnMarsNFT.methods
      .transferFrom(
        TestAccount.TEAM.address,
        "0x5001FD9F7EcF5aC206F499fB93b6728Dca319165",
        1
      )
      .call({ from: TestAccount.TEAM.address });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("MoMNFT: You can not transfer this");
  });

  it("does not trade for Sunflower Land item if they don't have MoM NFT", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { millionOnMarsNFT } = await deployMoMContracts(web3);

    const result = millionOnMarsNFT.methods.trade(1, 1).send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    await expect(
      result.catch((e: Error) => Promise.reject(e.message))
    ).rejects.toContain("MoMNFT: Player does not have NFT to trade");
  });

  it("trades for Sunflower Land item", async () => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(process.env.ETH_NETWORK)
    );

    const { millionOnMarsNFT, inventory, farm } = await deployMoMContracts(
      web3
    );

    await millionOnMarsNFT.methods
      .addGameRole(TestAccount.TEAM.address)
      .send({ from: TestAccount.TEAM.address });

    await millionOnMarsNFT.methods.mint([TestAccount.PLAYER.address]).send({
      from: TestAccount.TEAM.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    // Mint it to the team address (not the player)
    await farm.methods.mint(TestAccount.PLAYER.address).send({
      from: TestAccount.TEAM.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    const farmNFT = await farm.methods
      .getFarm(1)
      .call({ from: TestAccount.PLAYER.address });

    // Mint rocket fuel
    await inventory.methods
      .gameMint(farmNFT.account, [910], [1], web3.utils.keccak256("randomID"))
      .send({
        from: TestAccount.TEAM.address,
        gasPrice: await web3.eth.getGasPrice(),
        gas: gasLimit,
      });

    await millionOnMarsNFT.methods.trade(1, 1).send({
      from: TestAccount.PLAYER.address,
      gasPrice: await web3.eth.getGasPrice(),
      gas: gasLimit,
    });

    expect(
      await millionOnMarsNFT.methods
        .balanceOf(TestAccount.PLAYER.address)
        .call({ from: TestAccount.TEAM.address })
    ).toEqual("0");

    expect(
      await inventory.methods
        .balanceOf(farmNFT.account, 910)
        .call({ from: TestAccount.PLAYER.address })
    ).toEqual("0");

    expect(
      await inventory.methods
        .balanceOf(farmNFT.account, 911)
        .call({ from: TestAccount.PLAYER.address })
    ).toEqual("1");
  });
});
