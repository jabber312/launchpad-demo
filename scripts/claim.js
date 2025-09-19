// scripts/claim.js
const hre = require("hardhat");

async function main() {
  const PRESALE = "0xFad14642Bd120187377d79b5B9b52433f5545315"; // your presale
  const [me] = await hre.ethers.getSigners();

  const p = await hre.ethers.getContractAt("Presale", PRESALE);

  const claimable = await p.claimable(me.address);
  console.log("You can claim:", hre.ethers.formatEther(claimable), "LCH");

  if (claimable === 0n) {
    console.log("⛔ Nothing to claim right now. Wait until vesting unlocks more.");
    return;
  }

  const tx = await p.claimTokens();
  await tx.wait();
  console.log("✅ Claimed successfully!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
