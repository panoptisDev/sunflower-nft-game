
   
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./Token.sol";
import "./Farm.sol";

/**
 * Whenever someone withdraws SFL from the game, a percentage gets placed into this Wishing Well. 
 * Every 3 days someone with WW tokens can claim their SFL from this contract
 */
contract WishingWell is ERC20, Ownable {
  using SafeMath for uint256;
    using ECDSA for bytes32;


    SunflowerLandToken token;
    ERC20 liquidityToken;
    SunflowerLand farm;

    uint private lockedPeriod = 60 * 60 * 24 * 3; // 3 days
    address private signer;

    mapping(address => uint) updatedAt;
    mapping(bytes32 => bool) public executed;

    event Wished(address indexed owner, uint tokens);
    event Rewarded(address indexed owner, uint tokens);


    constructor(SunflowerLandToken _token, ERC20 _liquidityToken, SunflowerLand _farm) payable ERC20("WishingWell", "WW") {
        token = _token;
        liquidityToken = _liquidityToken;
        farm = _farm;

        signer = msg.sender;
    }

    function destroy() public onlyOwner payable {
        // Burn SFL in well
        uint total = token.balanceOf(address(this));
        token.transfer(0x000000000000000000000000000000000000dEaD, total);

        address payable addr = payable(address(owner()));
        selfdestruct(addr);
    }

    function setLockedPeriod(uint period) public onlyOwner {
        lockedPeriod = period;
    }

    function transferSigner(address _signer) public onlyOwner {
        signer = _signer;
    }

    function verify(bytes32 hash, bytes memory signature) private view returns (bool) {
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        return ethSignedHash.recover(signature) == signer;
    }
    
    /**
     * Make a wish. This will be based on how many LP tokens you own
     */
    function wish() public {
        updatedAt[msg.sender] = block.timestamp;

        uint current = balanceOf(msg.sender);
        uint lpAmount = liquidityToken.balanceOf(msg.sender);

        if (lpAmount > current) {
            _mint(msg.sender, lpAmount - current);
        }

        if (lpAmount < current) {
            _burn(msg.sender, current - lpAmount);
        }

        emit Wished(msg.sender, lpAmount);
    }

    /**
     * Every 3 days after depositing, collecting or withdrawing a user must wait
     * This acts as a 'locked' period
     */
    function canCollect(address account) public view returns (bool) {
        // Just an extra safeguard
        if (balanceOf(account) == 0) {
            return false;
        }

        uint lastOpenDate = updatedAt[account];

        uint threeDaysAgo = block.timestamp.sub(lockedPeriod); 
        return lastOpenDate < threeDaysAgo;
    }

    /**
     * Grabs any SFL lying in the well
     */
    function collectFromWell(
        bytes memory signature,
        uint tokens,
        uint deadline,
        uint farmId
    ) public {
        require(tokens > 0, "WishingWell: Nothing to collect");
        require(deadline >= block.timestamp, "WishingWell: Deadline Passed");
        require(balanceOf(msg.sender) >= tokens, "WishingWell: Not enough tokens");
        require (canCollect(msg.sender), "WishingWell: Good things come for those who wait");

        updatedAt[msg.sender] = block.timestamp;

        // Oracle verify they have not withdrawn liquidity
        bytes32 txHash = keccak256(abi.encode(tokens,  _msgSender(), deadline, farmId));
        require(!executed[txHash], "WishingWell: Tx Executed");
        require(verify(txHash, signature), "WishingWell: Unauthorised");
        executed[txHash] = true;

        // Figure out how lucky a user was based on their initial wish
        uint tokensInWell = token.balanceOf(address(this));
        uint reward = tokensInWell.mul(tokens).div(totalSupply());

        // Don't be to greedy, max rewards is 10%
        if (reward > tokensInWell/10) {
            reward = tokensInWell/10;
        }
        
        // Get the holding address of the farm
        Farm memory farmNFT = farm.getFarm(farmId);
        token.transfer(farmNFT.account, reward);

        // While they are in the well, make another wish for next time
        wish();

        emit Rewarded(msg.sender, reward);
    }

    function lastUpdatedAt(address account) public view returns (uint) {
        return updatedAt[account];
    }

    function getLockedPeriod() public view returns (uint) {
        return lockedPeriod;
    }

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        require(false, "WishingWell: Transfer not allowed");

        return false;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        require(false, "WishingWell: Transfer not allowed");

        return false;
    }
}
