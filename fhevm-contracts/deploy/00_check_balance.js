const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("\n🔍 Checking Sepolia deployment readiness...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log("📍 Deployer Address:", deployerAddress);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployerAddress);
  const balanceInEth = ethers.formatEther(balance);
  
  console.log("💰 Balance:", balanceInEth, "ETH");
  
  // Check network
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, `(Chain ID: ${network.chainId})`);
  
  // Recommendations
  console.log("\n📋 Status Check:");
  
  if (network.chainId !== 11155111n) {
    console.log("❌ Wrong network! Expected Sepolia (11155111)");
    return;
  }
  
  console.log("✅ Network: Sepolia");
  
  if (parseFloat(balanceInEth) < 0.02) {
    console.log("⚠️  Low balance! Recommended: At least 0.05 ETH");
    console.log("   Get Sepolia ETH from: https://sepoliafaucet.com/");
  } else {
    console.log("✅ Balance: Sufficient for deployment");
  }
  
  // Estimate gas
  console.log("\n⛽ Estimated Deployment Cost:");
  console.log("   Gas Limit: ~5,000,000 gas");
  console.log("   Gas Price: ~20 gwei");
  console.log("   Estimated: ~0.01 - 0.02 ETH");
  
  if (parseFloat(balanceInEth) >= 0.02) {
    console.log("\n✅ Ready to deploy! Run:");
    console.log("   npm run deploy:sepolia");
  } else {
    console.log("\n❌ Not ready. Get more Sepolia ETH first.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
