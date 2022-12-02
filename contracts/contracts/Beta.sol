// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./Farm.sol";

contract SunflowerLandBeta is Ownable {
    using ECDSA for bytes32;

    mapping(address => uint) public createdAt;

    function deposit() external payable {}

    address private signer;
    address private team;
    SunflowerLand farm;

    constructor(SunflowerLand _farm) payable {
        farm = _farm;
        signer = _msgSender();
        team = _msgSender();
    }

    function transferSigner(address _signer) public onlyOwner {
        signer = _signer;
    }

    function transferTeam(address _team) public onlyOwner {
        team = _team;
    }

    function verify(bytes32 hash, bytes memory signature) public view returns (bool) {
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        return ethSignedHash.recover(signature) == signer;
    }
    
    /**
     * V1: An address can only create 1 farm - txHash is 
     */
    function createFarm(
        // Verification
        bytes memory signature,
        // Data
        address charity,
        uint amount
    ) public payable {
        bytes32 txHash = keccak256(abi.encodePacked(charity, amount, _msgSender()));
        require(verify(txHash, signature), "Beta: Unauthorised");

        require(createdAt[_msgSender()] == 0, "Beta: Farm already created");
        createdAt[_msgSender()] = block.timestamp;

        if (amount > 0) {
            // 90% to team
            uint teamAmount = amount * 90 / 100;
            (bool teamSent,) = team.call{value: teamAmount}("");
            require(teamSent, "Beta: Team Donation Failed");

            // Rest to charity
            uint charityAmount = amount - teamAmount;
            (bool charitySent,) = charity.call{value: charityAmount}("");
            require(charitySent, "Beta: Charity Donation Failed");
        }

        bool minted = farm.mint(_msgSender());
        require(minted, "Beta: Unable to mint farm");
    }

    function farmCreatedAt(address account) public view returns (uint) {
        return createdAt[account];
    }
}