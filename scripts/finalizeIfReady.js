const hre = require("hardhat");
async function main() {
  const p = await hre.ethers.getContractAt(
    "Presale",
    "0x52487912285905a53cED2CF20641c7171c8CfcF1"
  );
  const s = await p.status();
  console.log("status:", s.toString());
  if (s.toString() === "2") {
    const tx = await p.finalize("0x4EC58910Acec4DaC1266e3c5fd747Ed6F113C504");
    await tx.wait();
    console.log("Finalized ✅");
  } else {
    console.log("Not ended yet. Try again later.");
  }
}
main().catch(e => (console.error(e), process.exit(1)));
