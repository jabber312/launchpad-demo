const hre = require("hardhat");
async function main() {
  const presale = await hre.ethers.getContractAt(
    "Presale",
    "0x52487912285905a53cED2CF20641c7171c8CfcF1"
  );
  const tx = await presale.contribute({ value: hre.ethers.parseEther("0.02") });
  await tx.wait();
  console.log("Contributed 0.02 ETH ✅");
}
main().catch(e => { console.error(e); process.exit(1); });
