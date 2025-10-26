const hre = require("hardhat");

async function main() {
  console.log("Deploying FHECoinFlip contract with FHEVM support...");
  
  const FHECoinFlip = await hre.ethers.getContractFactory("FHECoinFlip");
  const fheCoinFlip = await FHECoinFlip.deploy();
  
  await fheCoinFlip.waitForDeployment();
  
  const address = await fheCoinFlip.getAddress();
  console.log("FHECoinFlip deployed to:", address);
  
  // Log contract details
  console.log("\nContract Details:");
  console.log("- Owner:", await fheCoinFlip.owner());
  console.log("- Min Bet:", hre.ethers.formatEther(await fheCoinFlip.minBet()), "ETH");
  console.log("- Max Bet:", hre.ethers.formatEther(await fheCoinFlip.maxBet()), "ETH");
  console.log("- House Edge:", await fheCoinFlip.houseEdge(), "%");
  console.log("- FHEVM Enabled: ✅");
  console.log("- Network:", hre.network.name);
  
  // Save contract address for frontend
  const fs = require('fs');
  const contractInfo = {
    address: address,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 1337,
    fhevmEnabled: true
  };
  
  fs.writeFileSync(
    './frontend/src/contracts/contract-info.json',
    JSON.stringify(contractInfo, null, 2)
  );
  
  console.log("\nContract info saved to frontend/src/contracts/contract-info.json");
  console.log("\n🔐 This contract uses FHEVM for encrypted randomness!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
