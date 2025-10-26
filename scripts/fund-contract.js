const hre = require("hardhat");

async function main() {
  console.log("Funding FHECoinFlip contract...");
  
  // Get the contract address from the contract info
  const contractInfo = require('../frontend/src/contracts/contract-info.json');
  const contractAddress = contractInfo.address;
  
  console.log("Contract Address:", contractAddress);
  
  // Get the contract instance
  const FHECoinFlip = await hre.ethers.getContractFactory("FHECoinFlip");
  const contract = FHECoinFlip.attach(contractAddress);
  
  // Check current balance
  const currentBalance = await contract.getContractBalance();
  console.log("Current contract balance:", hre.ethers.formatEther(currentBalance), "ETH");
  
  // Fund amount (0.5 ETH)
  const fundAmount = hre.ethers.parseEther("0.5");
  console.log("Funding with:", hre.ethers.formatEther(fundAmount), "ETH");
  
  // Fund the contract
  const tx = await contract.fundContract({ value: fundAmount });
  console.log("Transaction hash:", tx.hash);
  
  // Wait for confirmation
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  
  // Check new balance
  const newBalance = await contract.getContractBalance();
  console.log("New contract balance:", hre.ethers.formatEther(newBalance), "ETH");
  
  console.log("✅ Contract funded successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
