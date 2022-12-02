
   
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "./GameOwner.sol";

contract SunflowerLandToken is ERC20Pausable, GameOwner {
  address private team;

  constructor() payable ERC20("Sunflower Land", "SFL") {
      team = msg.sender;
      gameRoles[msg.sender] = true;
  }

  function passTeamRole(address _team) public onlyOwner returns (bool) {
    team = _team;

    return true;
  }
  
  function gameMint(address account, uint256 amount) public onlyGame returns (bool){
	_mint(account, amount);
    return true;
 }

  function gameBurn(address account, uint256 amount) public onlyGame returns (bool){
	_burn(account, amount);
    return true;
  }

  function gameTransfer(address from, address to, uint256 amount) public onlyGame returns (bool){
	_transfer(from, to, amount);
    return true;
  }

  function gameApprove(address spender, uint256 amount) public onlyGame returns (bool) {
    _approve(_msgSender(), spender, amount);
    return true;
  }
}
