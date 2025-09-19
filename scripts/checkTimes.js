const hre = require("hardhat");
async function main() {
  const p = await hre.ethers.getContractAt("Presale", "0xFad14642Bd120187377d79b5B9b52433f5545315");
  const c = await p.config();
  const s = await p.status();
  console.log("start:", new Date(Number(c.start) * 1000).toLocaleString());
  console.log("end  :", new Date(Number(c.end) * 1000).toLocaleString());
  console.log("status:", s.toString(), "(0 NotStarted, 1 Live, 2 Ended, 3 Finalized, 4 RefundsEnabled)");
}
main().catch(e => (console.error(e), process.exit(1)));
