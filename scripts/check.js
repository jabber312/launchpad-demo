const hre = require("hardhat");
async function main() {
  const presaleAddr = "0x52487912285905a53cED2CF20641c7171c8CfcF1";
  const me = "0x036F6a1b30187C5966725D219cedd39D8772F130";
  const p = await hre.ethers.getContractAt("Presale", presaleAddr);
  const status = await p.status();
  const raised = await p.totalRaised();
  const mine = await p.contributions(me);
  console.log("Status:", status.toString(), "(1=Live)");
  console.log("Total Raised:", hre.ethers.formatEther(raised), "ETH");
  console.log("My Contribution:", hre.ethers.formatEther(mine), "ETH");
}
main().catch(e => { console.error(e); process.exit(1); });
