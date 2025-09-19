// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract LaunchToken is ERC20, Ownable {
    mapping(address => bool) public minters;

    constructor(string memory name_, string memory symbol_)
        ERC20(name_, symbol_) Ownable(msg.sender) {}

    modifier onlyMinter() {
        require(minters[msg.sender], "Not minter");
        _;
    }

    function setMinter(address who, bool isMinter) external onlyOwner {
        minters[who] = isMinter;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}
