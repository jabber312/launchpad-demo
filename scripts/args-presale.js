// scripts/args-presale.js
const { parseEther, parseUnits } = require("ethers");

module.exports = [
  {
    start: 1758317678,                 // 9/19/2025, 2:34:38 PM (your deploy)
    end: 1758319478,                   // 9/19/2025, 3:04:38 PM
    softCap: parseEther("0.01"),
    hardCap: parseEther("0.05"),
    minBuy: parseEther("0.005"),
    maxBuy: parseEther("0.05"),
    rate: parseUnits("1000", 18),      // 1 ETH -> 1000 tokens
    treasury: "0x036F6a1b30187C5966725D219cedd39D8772F130",
    tgeBps: 1000,                      // 10%
    vestingDuration: 300               // 5 minutes
  },
  "0x036F6a1b30187C5966725D219cedd39D8772F130" // owner (deployer)
];
