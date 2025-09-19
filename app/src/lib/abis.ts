export const PRESALE_ABI = [
  { "inputs": [], "name": "status", "outputs": [{"internalType":"uint8","name":"","type":"uint8"}], "stateMutability":"view","type":"function" },
  { "inputs": [{"internalType":"address","name":"","type":"address"}], "name":"contributions", "outputs":[{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view","type":"function" },
  { "inputs": [{"internalType":"address","name":"user","type":"address"}], "name":"claimable", "outputs":[{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view","type":"function" },
  { "inputs": [{"internalType":"address","name":"user","type":"address"}], "name":"refundable", "outputs":[{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view","type":"function" },
  { "inputs": [], "name": "config", "outputs": [
      {"internalType":"uint64","name":"start","type":"uint64"},
      {"internalType":"uint64","name":"end","type":"uint64"},
      {"internalType":"uint256","name":"softCap","type":"uint256"},
      {"internalType":"uint256","name":"hardCap","type":"uint256"},
      {"internalType":"uint256","name":"minBuy","type":"uint256"},
      {"internalType":"uint256","name":"maxBuy","type":"uint256"},
      {"internalType":"uint256","name":"rate","type":"uint256"},
      {"internalType":"address","name":"treasury","type":"address"},
      {"internalType":"uint16","name":"tgeBps","type":"uint16"},
      {"internalType":"uint64","name":"vestingDuration","type":"uint64"}
    ], "stateMutability":"view", "type":"function" },
  { "inputs": [], "name":"totalRaised", "outputs":[{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view","type":"function" },
  { "inputs": [], "name":"contribute", "outputs": [], "stateMutability":"payable", "type":"function" },
  { "inputs": [], "name":"claimTokens", "outputs": [], "stateMutability":"nonpayable", "type":"function" },
  { "inputs": [], "name":"refund", "outputs": [], "stateMutability":"nonpayable", "type":"function" }
];

export const ERC20_ABI = [
  { "inputs":[{"internalType":"address","name":"","type":"address"}], "name":"balanceOf", "outputs":[{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view","type":"function" },
  { "inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}], "name":"approve", "outputs":[{"internalType":"bool","name":"","type":"bool"}], "stateMutability":"nonpayable","type":"function" },
  { "inputs": [], "name":"decimals", "outputs":[{"internalType":"uint8","name":"","type":"uint8"}], "stateMutability":"view","type":"function" }
];
