const hre = require("hardhat");

async function main() {
  const presaleAddr = "0xFad14642Bd120187377d79b5B9b52433f5545315"; // your Presale
  const [user] = await hre.ethers.getSigners();

  const Presale = await hre.ethers.getContractAt("Presale", presaleAddr);
  const claimable = await Presale.claimable(user.address);

  console.log("Your claimable tokens:", hre.ethers.formatEther(claimable), "LCH");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});