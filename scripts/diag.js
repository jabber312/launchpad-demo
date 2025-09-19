const hre = require("hardhat");

const PRESALE = "0xFad14642Bd120187377d79b5B9b52433f5545315"; // <- your latest presale
const TOKEN   = "0xf13972B079996c1Ac56BA8D021C5E7d35edc98D6"; // <- your latest token

async function main() {
  const [me] = await hre.ethers.getSigners();
  const p = await hre.ethers.getContractAt("Presale", PRESALE);

  // read status & config
  const s = await p.status(); // 0 NotStarted, 1 Live, 2 Ended, 3 Finalized, 4 RefundsEnabled
  const c = await p.config(); // see indices below

  // common fields (keep casts defensive)
  const start = Number(c.start ?? c[0]);
  const end   = Number(c.end   ?? c[1]);
  const soft  = c.softCap ?? c[2];
  const hard  = c.hardCap ?? c[3];
  const minB  = c.minBuy  ?? c[4];
  const maxB  = c.maxBuy  ?? c[5];
  const rate  = c.rate    ?? c[6];
  const tgeBps= Number(c.tgeBps ?? c[8]);
  const vest  = Number(c.vestingDuration ?? c[9]);

  // user-specific
  const raised = await p.totalRaised();
  const myEth  = await p.contributions(me.address);

  // these may not exist on every contract; try/catch them
  let claimable = 0n, claimed = 0n, tokenAddr = "0x";
  try { claimable = await p.claimable(me.address); } catch {}
  try { claimed   = await p.claimed(me.address);   } catch {}
  try { tokenAddr = await p.token();               } catch {}

  console.log("== Presale DIAG ==");
  console.log("Presale:", PRESALE);
  console.log("Token  :", tokenAddr !== "0x" ? tokenAddr : "(no token() getter, expected)", " / UI token:", TOKEN);
  console.log("Status :", s.toString(), "(0 NotStarted,1 Live,2 Ended,3 Finalized,4 RefundsEnabled)");
  console.log("Times  :", {
    start_unix: start, end_unix: end,
    start_local: new Date(start*1000).toLocaleString(),
    end_local:   new Date(end*1000).toLocaleString(),
  });
  console.log("Caps   :", {
    softCap: hre.ethers.formatEther(soft ?? 0n) + " ETH",
    hardCap: hre.ethers.formatEther(hard ?? 0n) + " ETH",
    minBuy:  hre.ethers.formatEther(minB  ?? 0n) + " ETH",
    maxBuy:  hre.ethers.formatEther(maxB  ?? 0n) + " ETH",
  });
  console.log("Rate   :", hre.ethers.formatUnits(rate ?? 0n, 18), "tokens / ETH");
  console.log("Vesting:", { tgeBps, vestingDuration_sec: vest });
  console.log("Raised :", hre.ethers.formatEther(raised), "ETH");
  console.log("You    :", { ethContributed: hre.ethers.formatEther(myEth), claimed: claimed?.toString() || "(n/a)" });

  if (claimable !== 0n) {
    console.log("Claimable tokens now:", hre.ethers.formatEther(claimable), "LCH");
  } else {
    console.log("Claimable tokens now: 0");
  }
}

main().catch((e) => (console.error(e), process.exit(1)));
