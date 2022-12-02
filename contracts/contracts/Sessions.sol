// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


import "./Inventory.sol";
import "./Token.sol";
import "./Farm.sol";
// import "./Uniswap.sol";
import "./GameOwner.sol";

contract SunflowerLandSession is Ownable, GameOwner {
    using ECDSA for bytes32;

    event SessionChanged(address indexed owner, bytes32 indexed sessionId, uint indexed farmId);

    mapping(bytes32 => bool) public executed;

    // Farm ID to saved timestamp
    mapping(uint => bytes32) public sessions;
    mapping(uint => uint) public syncedAt;

    struct Recipe {
        uint256 mintId;
        uint256[] ingredientIds;
        uint256[] ingredientAmounts;
        uint256 maxSupply;
        uint256 cooldownSeconds;
        uint256 tokenAmount;
        bool enabled;
    }

    // Token ID to recipe
    mapping(uint256 => Recipe) private recipes;
    // Farm ID -> Token ID -> MintedAt (seconds)
    mapping(uint256 => mapping(uint256 => uint256)) private mintedAt;

    function deposit() external payable {}

    address private signer;
    address private syncFeeWallet;
    address private withdrawFeeWallet;
    address private wishingWell;

    // 0.1
    uint private mintFee = 1 * (10 ** 17);
    // 0.1
    uint private syncFee = 1 * (10 ** 17);

    // 30% of the fee goes into the wishing well
    uint private wishingWellTax = 30;

    // Whether to liquidate fees instead of sending SFL token
    bool private liquify = false;

    // Humanly possible values earnt during a gameplay session
    uint private maxSessionSFL = 100 * (10 ** 18);
    mapping(uint => uint) private maxSessionItems;

    // How much this contract is approved to mint
    uint private mintAllowance = 5000000 * (10 ** 18);
    uint private mintedAmount = 0;


    SunflowerLandInventory inventory;
    SunflowerLandToken token;
    SunflowerLand farm;
    // Enable for deploy - disable for testing
    //IUniswapV2Router02 public immutable uniswapV2Router;

    constructor(SunflowerLandInventory _inventory, SunflowerLandToken _token, SunflowerLand _farm) payable {
        inventory = _inventory;
        token = _token;
        farm = _farm;
        signer = _msgSender();
        syncFeeWallet = _msgSender();
        withdrawFeeWallet = _msgSender();

        gameRoles[_msgSender()] = true;
        // Enable for deploy - disable for testing
        //uniswapV2Router = IUniswapV2Router02(0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff);
    }

    function destroy() public onlyOwner payable {
        address payable addr = payable(address(owner()));
        selfdestruct(addr);
    }

    function transferSigner(address _signer) public onlyOwner {
        signer = _signer;
    }

    function transferSyncFeeWallet(address _team) public onlyOwner {
        syncFeeWallet = _team;
    }

    function transferWithdrawFeeWallet(address _team) public onlyOwner {
        withdrawFeeWallet = _team;
    }

    function setMintFee(uint _fee) public onlyOwner {
        mintFee = _fee;
    }

    function setSyncFee(uint _fee) public onlyOwner {
        syncFee = _fee;
    }

    function setWishingWellTax(uint _tax) public onlyOwner {
        wishingWellTax = _tax;
    }

    function setLiquify(bool _liquify) public onlyOwner {
        liquify = _liquify;
    }

    function setWishingWell(address _wishingWell) public onlyOwner {
        wishingWell = _wishingWell;
    }


    function setMaxSessionSFL(uint _amount) public onlyOwner {
        maxSessionSFL = _amount;
    }

    function setMaxItemAmounts(uint256[] memory _ids, uint256[] memory _amounts) public onlyOwner {
        require(_ids.length == _amounts.length, "SunflowerLand: Invalid length mismatch");
        for(uint index=0; index < _ids.length; index++) {
            maxSessionItems[_ids[index]] = _amounts[index];
        }
    }

    function getMaxItemAmounts(uint256[] memory _ids) public view returns (uint256[] memory) {
        uint256[] memory amounts = new uint256[](_ids.length);

        for(uint index=0; index < _ids.length; index++) {
            amounts[index] = (maxSessionItems[_ids[index]]);
        }

        return amounts;
    }

    function setMintAllowance(uint _amount) public onlyOwner {
        mintAllowance = _amount;
    }

    function getSyncedAt(uint tokenId) public view returns(uint) {
        return syncedAt[tokenId];
    }

    // A unique nonce identifer for the account
    function generateSessionId(uint tokenId) private view returns(bytes32) {
        return keccak256(abi.encodePacked(_msgSender(), sessions[tokenId], block.number)).toEthSignedMessageHash();
    }

    function getSessionId(uint tokenId) public view returns(bytes32) {
        bytes32 id = sessions[tokenId];

        if (id == 0) {
            // First ID is based on the unique contract
            id = keccak256(abi.encode(address(this)));
        }

        return id;
    }

    struct Session {
        bytes32 id;
        uint256 syncedAt;
        uint256[] mintedAts;
    }

    function getSession(uint tokenId, uint256[] memory ids) public view returns (Session memory) {
        return Session({
            id: getSessionId(tokenId),
            syncedAt: syncedAt[tokenId],
            mintedAts: getMintedAtBatch(tokenId, ids)
        });
    }

    function updateSession(uint tokenId) public onlyGame returns(bool) {
        sessions[tokenId] =  generateSessionId(tokenId);
        return true;
    }

    function verify(bytes32 hash, bytes memory signature) private view returns (bool) {
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        return ethSignedHash.recover(signature) == signer;
    }

    modifier isReady(uint farmId) {
        require(syncedAt[farmId] < block.timestamp - 15, "SunflowerLand: Too many requests");
        _;
    }

    function mintSignature(
        bytes32 sessionId,
        uint256 farmId,
        uint256 deadline,
        uint256 mintId
    ) private view returns(bytes32 success) {
        /**
         * Distinct order and abi.encode to avoid hash collisions
         */
        return keccak256(abi.encode(mintId, deadline, _msgSender(), sessionId, farmId));
    }

    function syncSignature(
        bytes32 sessionId,
        uint256 farmId,
        uint256 deadline,
        uint256[] memory mintIds,
        uint256[] memory mintAmounts,
        uint256[] memory burnIds,
        uint256[] memory burnAmounts,
        int256 tokens
    ) private view returns(bytes32 success) {
        /**
         * Distinct order and abi.encode to avoid hash collisions
         */
        return keccak256(abi.encode(sessionId, tokens, farmId, mintIds, mintAmounts, _msgSender(), burnIds, burnAmounts, deadline));
    }

    /**
     * Start a new session
     */
    function startNewSession(uint256 farmId) private returns (bytes32) {
        bytes32 newSessionId = generateSessionId(farmId);
        sessions[farmId] = newSessionId;
        syncedAt[farmId] = block.timestamp;
        return newSessionId;
    }

    function getMintedAt(uint256 farmId, uint256 mintId) private view returns (uint256) {
        return mintedAt[farmId][mintId];
    }

    function getMintedAtBatch(uint256 farmId, uint256[] memory mintIds) public view returns (uint256[] memory) {
        uint256[] memory mintedAts = new uint256[](mintIds.length);

        for (uint256 i = 0; i < mintIds.length; ++i) {
            mintedAts[i] = getMintedAt(farmId, mintIds[i]);
        }

        return mintedAts;
    }

    function setMintedAt(uint256 farmId, uint256 mintId, uint256 _mintedAt) private returns (bool) {
        mintedAt[farmId][mintId] = _mintedAt;
        return true;
    }

    // This is explicitly named a "Bulk" function as the function arguments do not align with a normal "Batch" functions (e.g. getMintedAtBatch)
    function setMintedAtBulk(uint256[] memory _farmIds, uint256 _mintId, uint256 _mintedAt) external onlyGame returns (bool[] memory) {
        bool[] memory results = new bool[](_farmIds.length);

        for (uint256 i = 0; i < _farmIds.length; ++i) {
            results[i] = setMintedAt(_farmIds[i], _mintId, _mintedAt);
        }

        return results;
    }

    /**
     * Craft items on chain
     */
    function mint(
        // Verification
        bytes memory signature,
        bytes32 sessionId,
        uint256 deadline,
        // Data
        uint256 farmId,
        uint256 mintId
    ) external payable isReady(farmId) returns(bool success) {
        require(msg.value >= mintFee, "SunflowerLand: Missing fee");
        require(deadline >= block.timestamp, "SunflowerLand: Deadline Passed");

        require(getSessionId(farmId) == sessionId, "SunflowerLand: Session has changed");
        bytes32 newSessionId = startNewSession(farmId);

        // Verify
        bytes32 txHash = mintSignature(sessionId, farmId, deadline, mintId);
        require(!executed[txHash], "SunflowerLand: Tx Executed");
        require(verify(txHash, signature), "SunflowerLand: Unauthorised");
        executed[txHash] = true;

        Farm memory farmNFT = farm.getFarm(farmId);
        require(farmNFT.owner == _msgSender(), "SunflowerLand: You do not own this farm");

        Recipe memory recipe = getRecipe(mintId);
        require(recipe.enabled, "SunflowerLand: The recipe is not ready");

        // Do our external calls before the supply check + mint
        (bool teamSent,) = syncFeeWallet.call{value: msg.value}("");
        require(teamSent, "SunflowerLand: Fee Failed");

        uint256 totalSupply = inventory.totalSupply(mintId);
        require(totalSupply < recipe.maxSupply, "SunflowerLand: Max supply reached");

        uint256 _mintedAt = getMintedAt(farmId, mintId);
        require((_mintedAt + recipe.cooldownSeconds) < block.timestamp, "SunflowerLand: Cooldown period has not elapsed");
        setMintedAt(farmId, mintId, block.timestamp);

        // Dynamically sized Arrays of length 1
        uint256[] memory mintIds = new uint256[](1);
        uint256[] memory mintAmounts = new uint256[](1);
        // Intialises the only element in the array
        mintIds[0] = mintId;
        mintAmounts[0] = 1;

        // Burn resources
        inventory.gameBurn(farmNFT.account, recipe.ingredientIds, recipe.ingredientAmounts);
        token.gameTransfer(farmNFT.account, 0x000000000000000000000000000000000000dEaD, recipe.tokenAmount);
        // Mint item
        inventory.gameMint(farmNFT.account, mintIds, mintAmounts, "");

        emit SessionChanged(farmNFT.owner, newSessionId, farmId);
        
        return true;
    }

    /**
     * Bring off chain data on chain
     */
    function sync(
        // Verification
        bytes memory signature,
        bytes32 sessionId,
        uint deadline,
        // Data
        uint farmId,
        uint256[] memory mintIds,
        uint256[] memory mintAmounts,
        uint256[] memory burnIds,
        uint256[] memory burnAmounts,
        int256 tokens
    ) external payable isReady(farmId) returns(bool success) {
       require(msg.value >= syncFee, "SunflowerLand: Missing fee");
       require(deadline >= block.timestamp, "SunflowerLand: Deadline Passed");

        require(getSessionId(farmId) == sessionId, "SunflowerLand: Session has changed");
        bytes32 newSessionId = startNewSession(farmId);

        // Verify
        bytes32 txHash = syncSignature(sessionId, farmId, deadline, mintIds, mintAmounts, burnIds, burnAmounts, tokens);
        require(!executed[txHash], "SunflowerLand: Tx Executed");
        require(verify(txHash, signature), "SunflowerLand: Unauthorised");
        executed[txHash] = true;

        Farm memory farmNFT = farm.getFarm(farmId);
        require(farmNFT.owner == _msgSender(), "SunflowerLand: You do not own this farm");

        updateSessionBalance(farmNFT.account, mintIds, mintAmounts, burnIds, burnAmounts, tokens);

        (bool teamSent,) = syncFeeWallet.call{value: msg.value}("");
        require(teamSent, "SunflowerLand: Fee Failed");

        emit SessionChanged(farmNFT.owner, newSessionId, farmId);

        return true;
    }

    function updateSessionBalance(
        address account,
        uint256[] memory mintIds,
        uint256[] memory mintAmounts,
        uint256[] memory burnIds,
        uint256[] memory burnAmounts,
        int256 tokens
    ) private {
        if (mintIds.length > 0) {
            for(uint index=0; index < mintIds.length; index++) {
                require(mintAmounts[index] <= maxSessionItems[mintIds[index]], "SunflowerLand: Item mint exceeds max mint amount" );
            }

            inventory.gameMint(account, mintIds, mintAmounts, "");
        }

        if (burnIds.length > 0) {
            inventory.gameBurn(account, burnIds, burnAmounts);
        }

        if (tokens > 0) {
            // Player is trying to mint more than humanly possible in a session
            require(uint256(tokens) <= maxSessionSFL, "SunflowerLand: SFL Exceeds max mint amount");

            mintedAmount += uint256(tokens);

            // Contract is only authorised to mint a total of X amount (Similar to an ERC20 allowance)
            require(mintedAmount < mintAllowance, "SunflowerLand: Session allowance exceeded");
    
            token.gameMint(account, uint256(tokens));
        } else if (tokens < 0) {
            // Send to the burn address so total supply keeps increasing
            token.gameTransfer(account, 0x000000000000000000000000000000000000dEaD, uint256(-tokens));
        }
    }

    function withdraw(
        // Verification
        bytes memory signature,
        bytes32 sessionId,
        uint deadline,
        // Data
        uint farmId,
        uint256[] memory ids,
        uint256[] memory amounts,
        uint256 sfl,
        // 100 = 10%
        uint tax
    ) public isReady(farmId) returns (bool) {
       require(deadline >= block.timestamp, "SunflowerLand: Deadline Passed");

        require(getSessionId(farmId) == sessionId, "SunflowerLand: Session has changed");
        bytes32 newSessionId = startNewSession(farmId);

        // Verify
        bytes32 txHash = keccak256(abi.encode(sessionId, deadline,  _msgSender(), farmId, ids, amounts, sfl, tax));
        require(!executed[txHash], "SunflowerLand: Tx Executed");
        require(verify(txHash, signature), "SunflowerLand: Unauthorised");
        executed[txHash] = true;

        Farm memory farmNFT = farm.getFarm(farmId);
        require(farmNFT.owner == _msgSender(), "SunflowerLand: You do not own this farm");

        // Ensure item is still not being crafted
        for(uint index=0; index < ids.length; index++) {
            uint256 _mintedAt = mintedAt[farmId][ids[index]];
            require((_mintedAt + recipes[ids[index]].cooldownSeconds) < block.timestamp, "SunflowerLand: Cooldown period has not elapsed");
        }

        if (sfl > 0) {
            // Distribution fee
            uint teamFee = sfl * tax / 1000;
            takeFee(farmNFT.account, teamFee);

            // Withdraw from farm
            uint remaining = sfl - teamFee;
            token.gameTransfer(farmNFT.account, _msgSender(), remaining);
        }

        inventory.gameTransferFrom(farmNFT.account, _msgSender(), ids, amounts, "");

        emit SessionChanged(farmNFT.owner, newSessionId, farmId);

        return true;
    }

    function takeFee(address from, uint amount) private {
        token.gameTransfer(from, address(this), amount);

        uint wishingWellFee = amount * wishingWellTax / 100;
        uint remaining = amount - wishingWellFee;

        bool wishingWellSuccess = token.transfer(wishingWell, wishingWellFee);
        require(wishingWellSuccess == true, "SunflowerLand: Transfer Failed");

        if (liquify) {
            // Enable for deploy - disable for testing
            //liquidate(remaining);
        } else {
            bool withdrawFeeSuccess = token.transfer(withdrawFeeWallet, remaining);
            require(withdrawFeeSuccess == true, "SunflowerLand: Transfer Failed");
        }
    }

    // Enable for deploy - disable for testing

    // function liquidate(uint amount) private {
    //     token.approve(address(uniswapV2Router), amount);

    //     address[] memory path = new address[](2);
    //     path[0] = address(token);
    //     path[1] = uniswapV2Router.WETH();

    //     // make the swap
    //     uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
    //         amount,
    //         0, // accept any amount of ETH
    //         path,
    //         withdrawFeeWallet,
    //         block.timestamp
    //     );
    // }

  function getRecipe(uint256 id) public view returns (Recipe memory) {
    return recipes[id];
  }

  function getRecipeBatch(uint256[] memory ids) external view returns (Recipe[] memory) {
        Recipe[] memory _recipes = new Recipe[](ids.length);

        for (uint256 i = 0; i < ids.length; ++i) {
            _recipes[i] = getRecipe(ids[i]);
        }

        return _recipes;
  }


  function removeRecipeBatch(uint256[] memory ids) external onlyGame returns (bool[] memory) {
        bool[] memory results = new bool[](ids.length);

        for (uint256 i = 0; i < ids.length; ++i) {
            delete(recipes[ids[i]]);
            results[i] = true;
        }

        return results;
  }

  function addRecipeBatch(Recipe[] memory _recipes) external onlyGame returns (bool[] memory) {
        bool[] memory results = new bool[](_recipes.length);

        for (uint256 i = 0; i < _recipes.length; ++i) {
            Recipe memory recipe = _recipes[i];
            require(
                recipe.ingredientIds.length == recipe.ingredientAmounts.length,
                "SunflowerLand: Recipe array length mismatch"
            );
            recipes[recipe.mintId] = recipe;
            results[i] = true;
        }

        return results;
  }
}