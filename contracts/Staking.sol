// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ReentrancyGuard, Ownable {
    IERC20 public immutable token;
    uint256 public rewardRate; // tokens per second per staked token scaled by 1e18

    uint256 public rewardPerTokenStored;
    uint256 public lastUpdate;
    uint256 public totalStaked;

    mapping(address => uint256) public userStake;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    constructor(IERC20 _token, address initialOwner) Ownable(initialOwner) {
        token = _token;
    }

    function _update() internal {
        uint256 time = block.timestamp;
        if (totalStaked > 0) {
            rewardPerTokenStored += (rewardRate * (time - lastUpdate)) / totalStaked;
        }
        lastUpdate = time;
    }

    function setRewardRate(uint256 newRate) external onlyOwner {
        _update();
        rewardRate = newRate;
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "0");
        _update();
        rewards[msg.sender] += (userStake[msg.sender] * (rewardPerTokenStored - userRewardPerTokenPaid[msg.sender])) / 1e18;
        userRewardPerTokenPaid[msg.sender] = rewardPerTokenStored;

        totalStaked += amount;
        userStake[msg.sender] += amount;
        require(token.transferFrom(msg.sender, address(this), amount), "transfer fail");
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0 && amount <= userStake[msg.sender], "bad amt");
        _update();
        rewards[msg.sender] += (userStake[msg.sender] * (rewardPerTokenStored - userRewardPerTokenPaid[msg.sender])) / 1e18;
        userRewardPerTokenPaid[msg.sender] = rewardPerTokenStored;

        totalStaked -= amount;
        userStake[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount), "transfer fail");
    }

    function claim() external nonReentrant {
        _update();
        uint256 r = rewards[msg.sender] + (userStake[msg.sender] * (rewardPerTokenStored - userRewardPerTokenPaid[msg.sender])) / 1e18;
        userRewardPerTokenPaid[msg.sender] = rewardPerTokenStored;
        rewards[msg.sender] = 0;
        require(r > 0, "no rewards");
        require(token.transfer(msg.sender, r), "transfer fail");
    }
}
