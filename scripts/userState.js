const hre = require("hardhat");

// update to your current sale + token
const PRESALE = "0xFad14642Bd120187377d79b5B9b52433f5545315";
const TOKEN   = "0xf13972B079996c1Ac56BA8D021C5E7d35edc98D6";

async function main() {
  const [me] = await hre.ethers.getSigners();
  const p = await hre.ethers.getContractAt("Presale", PRESALE);

  const s = await p.status();                    // 0..4
  const c = await p.config();

  const rate   = c.rate   ?? c[6];
  const raised = await p.totalRaised();
  const myEth  = await p.contributions(me.address);

  let tokenAddr = "0x";
  try { tokenAddr = await p.token(); } catch {}

  // totals
  const totalTokens = (myEth * rate) / 10n**18n; // rate is tokens per 1e18 wei
  let claimed = 0n, claimable = 0n;
  try { claimed   = await p.claimed(me.address); } catch {}
  try { claimable = await p.claimable(me.address); } catch {}

  console.log("=== USER STATE ===");
  console.log("Wallet:", me.address);
  console.log("Status:", s.toString(), "(0 NotStarted,1 Live,2 Ended,3 Finalized,4 RefundsEnabled)");
  console.log("Presale token set to:", tokenAddr);
  console.log("Raised:", hre.ethers.formatEther(raised), "ETH");
  console.log("You contributed:", hre.ethers.formatEther(myEth), "ETH");
  console.log("Total tokens allocated:", hre.ethers.formatEther(totalTokens), "LCH");
  console.log("Claimed so far:", hre.ethers.formatEther(claimed), "LCH");
  console.log("Claimable now:", hre.ethers.formatEther(claimable), "LCH");
}

main().catch((e)=>{ console.error(e); process.exit(1); });