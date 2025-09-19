// scripts/deploy.js
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1) Deploy token
  const Token = await hre.ethers.getContractFactory("LaunchToken");
  const token = await Token.deploy("Launch Token", "LCH");
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("Token:", tokenAddr);

  // 2) Presale config (30-min sale window)
  const now = Math.floor(Date.now() / 1000);
  const START = now + 60;              // starts in ~1 minute
  const END   = START + 1800;          // ends 30 minutes after start

  const cfg = {
    start: START,
    end: END,
    softCap: hre.ethers.parseEther("0.01"),   // 0.01 ETH
    hardCap: hre.ethers.parseEther("0.05"),   // 0.05 ETH total
    minBuy: hre.ethers.parseEther("0.005"),   // 0.005 ETH per tx
    maxBuy: hre.ethers.parseEther("0.05"),    // 0.05 ETH per wallet
    rate: hre.ethers.parseUnits("1000", 18),  // 1 ETH -> 1000 tokens
    treasury: process.env.TREASURY,
    tgeBps: 1000,                              // 10% at TGE
    vestingDuration: 300                       // 5 minutes vesting for demo
  };

  // 3) Deploy presale
  const Presale = await hre.ethers.getContractFactory("Presale");
  const presale = await Presale.deploy(cfg, deployer.address);
  await presale.waitForDeployment();
  const presaleAddr = await presale.getAddress();
  console.log("Presale:", presaleAddr);

  // 4) Grant presale minting rights
  await (await token.setMinter(presaleAddr, true)).wait();
  console.log("Presale set as minter");

  // 5) Deploy staking (optional demo)
  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(tokenAddr, deployer.address);
  await staking.waitForDeployment();
  const stakingAddr = await staking.getAddress();
  console.log("Staking:", stakingAddr);

  // Nice to have: show human times
  console.log("\nTIMES (local):");
  console.log("  start:", new Date(START * 1000).toLocaleString());
  console.log("  end  :", new Date(END   * 1000).toLocaleString());

  console.log("\nNEXT STEPS:");
  console.log("- Wait ~1 min until presale shows Live");
  console.log("- Contribute 0.01–0.02 ETH while Live");
  console.log("- After 30 min (or once End passed) finalize with token address");
  console.log("- Then claimTokens() (10% TGE, rest over 5 min)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});