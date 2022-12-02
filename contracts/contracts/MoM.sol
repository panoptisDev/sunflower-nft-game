// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "./Inventory.sol";
import "./Farm.sol";
import "./GameOwner.sol";

contract MoMNFT is ERC721Enumerable, GameOwner  {
    SunflowerLandInventory inventory;
    SunflowerLand farm;

    // Inclusive of items traded (burnt) for Sunflower Land items
    uint private supply = 0;

    constructor(SunflowerLandInventory _inventory, SunflowerLand _farm) ERC721("MoM Sunflower Crossover", "MSF")  {
        inventory = _inventory;
        farm = _farm;
    }

    function destroy() public onlyOwner payable {
        address payable addr = payable(address(owner()));
        selfdestruct(addr);
    }

    function mint(address[] memory accounts) public onlyGame {
        for (uint i = 0; i < accounts.length; i++) {
            supply = supply + 1;
            _mint(accounts[i], supply);
        }

    }

    function trade(uint tokenId, uint farmId) public {
        require(balanceOf(_msgSender()) > 0, "MoMNFT: Player does not have NFT to trade");
        require(ownerOf(tokenId) == _msgSender(), "MoMNFT: You are not the owner");

        _burn(tokenId);

        // Get the holding address of the farm
        Farm memory farmNFT = farm.getFarm(farmId);

        // Check they own the farm
        require(
            farmNFT.owner == _msgSender(),
            "SunflowerLand: You do not own this farm"
        );
        
        // Burn the rocket repair
        uint256[] memory burnIds = new uint256[](1);
        uint256[] memory burnAmounts = new uint256[](1);

        // Intialises the only element in the array
        burnIds[0] = 910;
        burnAmounts[0] = 1;
        inventory.gameBurn(farmNFT.account, burnIds, burnAmounts);

        // Mint the observatory
        uint256[] memory mintIds = new uint256[](1);
        uint256[] memory mintAmounts = new uint256[](1);
        // Intialises the only element in the array
        mintIds[0] = 911;
        mintAmounts[0] = 1;
        
        inventory.gameMint(farmNFT.account, mintIds, mintAmounts, "");
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        require(false, "MoMNFT: You can not transfer this");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        require(false, "MoMNFT: You can not transfer this");

    }


    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        require(false, "MoMNFT: You can not transfer this");
    }

}