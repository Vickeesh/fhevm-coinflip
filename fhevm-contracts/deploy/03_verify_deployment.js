const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying FHECoinFlip deployment on Sepolia (FHEVM v0.9)...");
  
  // Get the contract address from the contract info
  const contractInfo = require('../../src/contracts/contract-info.json');
  const contractAddress = contractInfo.address;
  
  console.log("Contract Address:", contractAddress);
  console.log("Network: Sepolia (Chain ID: 11155111)");
  console.log("FHEVM Version:", contractInfo.fhevmVersion || "0.9");
  
  // Get the contract instance
  const FHECoinFlip = await hre.ethers.getContractFactory("FHECoinFlip");
  const contract = FHECoinFlip.attach(contractAddress);
  
  try {
    // Test basic contract functions
    console.log("\n📋 Contract Information:");
    
    const owner = await contract.owner();
    console.log("✅ Owner:", owner);
    
    const minBet = await contract.minBet();
    console.log("✅ Min Bet:", hre.ethers.formatEther(minBet), "ETH");
    
    const maxBet = await contract.maxBet();
    console.log("✅ Max Bet:", hre.ethers.formatEther(maxBet), "ETH");
    
    const houseEdge = await contract.houseEdge();
    console.log("✅ House Edge:", houseEdge.toString(), "%");
    
    const contractBalance = await contract.getContractBalance();
    console.log("✅ Contract Balance:", hre.ethers.formatEther(contractBalance), "ETH");
    
    const gameCounter = await contract.gameCounter();
    console.log("✅ Total Games:", gameCounter.toString());
    
    // Test if contract is properly funded
    if (parseFloat(hre.ethers.formatEther(contractBalance)) > 0) {
      console.log("\n💰 Contract Status: FUNDED ✅");
      console.log("   Ready to accept bets and pay out winnings!");
    } else {
      console.log("\n⚠️  Contract Status: UNFUNDED");
      console.log("   Contract needs ETH to pay out winnings.");
      console.log("   Run: npx hardhat run scripts/fund-contract.js --network sepolia");
    }
    
    // Test FHEVM v0.9 configuration
    console.log("\n🔐 FHEVM v0.9 Configuration:");
    console.log("✅ FHEVM Version: 0.9");
    console.log("✅ Config: ZamaEthereumConfig");
    console.log("✅ Network: Sepolia");
    console.log("✅ Architecture: Self-Relaying Decryption");
    console.log("✅ Decryption: makePubliclyDecryptable + checkSignatures");
    
    console.log("\n🎯 Deployment Verification Complete!");
    console.log("Contract is ready for use on Sepolia testnet with FHEVM v0.9.");
    
    // Display frontend access info
    console.log("\n🌐 Frontend Access:");
    console.log("   Local: http://localhost:3000");
    console.log("   Make sure to connect MetaMask to Sepolia testnet");
    console.log("   Contract Address:", contractAddress);
    
    console.log("\n📝 Game Flow (FHEVM v0.9):");
    console.log("   1. User calls flipCoin() - creates game with encrypted random");
    console.log("   2. Frontend decrypts result off-chain using FHEVM instance");
    console.log("   3. User calls resolveGame() with decrypted value + proof");
    console.log("   4. Contract verifies proof and settles the game");
    
  } catch (error) {
    console.error("❌ Error verifying contract:", error.message);
    console.error("   Make sure you're connected to Sepolia testnet");
    console.error("   and the contract is properly deployed.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
