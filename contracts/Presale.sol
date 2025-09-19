// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

interface IMintableToken {
    function mint(address to, uint256 amount) external;
}

contract Presale is Ownable, Pausable, ReentrancyGuard {
    using Address for address payable;

    enum Status { NotStarted, Live, Ended, Finalized, RefundsEnabled }

    struct Config {
        uint64 start;            // unix seconds
        uint64 end;              // unix seconds
        uint256 softCap;         // in wei
        uint256 hardCap;         // in wei
        uint256 minBuy;          // in wei
        uint256 maxBuy;          // in wei (per wallet)
        uint256 rate;            // tokens per 1 ETH, 18 decimals (e.g., 1000e18)
        address payable treasury;// receives ETH after finalize
        uint16 tgeBps;           // e.g., 1000 = 10% at TGE
        uint64 vestingDuration;  // seconds for linear unlock of the rest
    }

    Config public config;
    uint256 public totalRaised;      // in wei
    uint64   public tgeTime;         // set at finalize
    address  public token;           // set at finalize

    mapping(address => uint256) public contributions; // ETH per user
    mapping(address => uint256) public claimed;       // token amount claimed so far

    event Contributed(address indexed buyer, uint256 amountWei);
    event Finalized(address token, uint64 tgeTime);
    event Refunded(address indexed buyer, uint256 amountWei);
    event Claimed(address indexed buyer, uint256 amountTokens);

    constructor(Config memory _cfg, address initialOwner) Ownable(initialOwner) {
        require(_cfg.start < _cfg.end, "bad window");
        require(_cfg.softCap <= _cfg.hardCap, "soft>hard");
        require(_cfg.rate > 0, "rate=0");
        require(_cfg.treasury != address(0), "treasury=0");
        config = _cfg;
    }

    // ===== Views =====
    function status() public view returns (Status) {
        if (tgeTime != 0) return Status.Finalized;
        if (block.timestamp < config.start) return Status.NotStarted;
        if (block.timestamp >= config.start && block.timestamp <= config.end) return Status.Live;
        if (totalRaised < config.softCap) return Status.RefundsEnabled;
        return Status.Ended;
    }

    function tokensFor(address user) public view returns (uint256) {
        // total tokens allocated to user = contribution * rate / 1e18
        return contributions[user] * config.rate / 1e18;
    }

    function vestedFor(address user) public view returns (uint256) {
        uint256 total = tokensFor(user);
        if (tgeTime == 0) return 0; // not finalized
        // unlocked = TGE% + linear remainder over vestingDuration
        uint256 tgePart = total * config.tgeBps / 10000;
        if (config.vestingDuration == 0) {
            return total; // all at TGE
        }
        uint256 elapsed = block.timestamp > tgeTime ? (block.timestamp - tgeTime) : 0;
        if (elapsed >= config.vestingDuration) return total;
        uint256 linearPart = (total - tgePart) * elapsed / config.vestingDuration;
        return tgePart + linearPart;
    }

    function claimable(address user) public view returns (uint256) {
        uint256 v = vestedFor(user);
        if (v <= claimed[user]) return 0;
        return v - claimed[user];
    }

    function refundable(address user) public view returns (uint256) {
        Status s = status();
        if (s != Status.RefundsEnabled) return 0;
        return contributions[user];
    }

    // ===== Contribute / Claim / Refund =====
    function contribute() external payable whenNotPaused nonReentrant {
        require(status() == Status.Live, "not live");
        uint256 newTotal = totalRaised + msg.value;
        require(newTotal <= config.hardCap, ">hardCap");

        uint256 prev = contributions[msg.sender];
        uint256 afterAmt = prev + msg.value;
        require(afterAmt >= config.minBuy, "<minBuy");
        require(afterAmt <= config.maxBuy, ">maxBuy");

        contributions[msg.sender] = afterAmt;
        totalRaised = newTotal;
        emit Contributed(msg.sender, msg.value);
    }

    function claimTokens() external nonReentrant {
        require(status() == Status.Finalized, "not finalized");
        require(token != address(0), "token=0");
        uint256 amt = claimable(msg.sender);
        require(amt > 0, "nothing to claim");
        claimed[msg.sender] += amt;
        IMintableToken(token).mint(msg.sender, amt);
        emit Claimed(msg.sender, amt);
    }

    function refund() external nonReentrant {
        require(status() == Status.RefundsEnabled, "refunds off");
        uint256 amt = contributions[msg.sender];
        require(amt > 0, "no contrib");
        contributions[msg.sender] = 0;
        totalRaised -= amt;
        payable(msg.sender).sendValue(amt);
        emit Refunded(msg.sender, amt);
    }

    // ===== Admin =====
    function pause(bool p) external onlyOwner {
        if (p) _pause(); else _unpause();
    }

    function finalize(address _token) external onlyOwner {
        require(token == address(0), "already");
        require(block.timestamp > config.end, "not ended");
        require(totalRaised >= config.softCap, "<softCap");
        require(_token != address(0), "token=0");
        token = _token;
        tgeTime = uint64(block.timestamp);
        emit Finalized(_token, tgeTime);
        // forward raised ETH to treasury
        config.treasury.sendValue(address(this).balance);
    }

    // In emergency before finalize
    function withdrawStuckETH(address payable to, uint256 amt) external onlyOwner {
        to.sendValue(amt);
    }
}
