// scripts/finalize.js
const hre = require("hardhat");

async function main() {
  const PRESALE = "0xFad14642Bd120187377d79b5B9b52433f5545315"; // NEW sale
  const TOKEN   = "0xf13972B079996c1Ac56BA8D021C5E7d35edc98D6"; // NEW token

  const p = await hre.ethers.getContractAt("Presale", PRESALE);

  // Sanity read before finalizing
  const s = await p.status();
  console.log("Current status:", s.toString(), "(0 NotStarted,1 Live,2 Ended,3 Finalized,4 RefundsEnabled)");
  if (Number(s) !== 2) {
    console.log("⛔ Presale is not in Ended(2) state. Aborting.");
    return;
  }

  console.log("Finalizing with token:", TOKEN);
  const tx = await p.finalize(TOKEN);
  await tx.wait();
  console.log("✅ Presale finalized");
}

main().catch((e) => { console.error(e); process.exit(1); });
