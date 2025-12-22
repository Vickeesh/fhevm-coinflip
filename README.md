# 🪙 FHEVM CoinFlip dApp

A fully decentralized coin flip game built with **FHEVM (Fully Homomorphic Encryption Virtual Machine)** for provably fair, encrypted randomness. This dApp demonstrates the power of homomorphic encryption in blockchain gaming.

## ✨ Features

- 🔐 **FHEVM Integration**: Uses fully homomorphic encryption for provably fair randomness
- 🎮 **Real-time Gaming**: Instant coin flip results with encrypted verification
- 💰 **Smart Contract**: Secure betting with configurable limits and house edge
- 🎨 **Modern UI**: Beautiful, responsive interface with professional animations
- 🔄 **Wallet Integration**: MetaMask support with disconnect functionality
- 📱 **Mobile Ready**: Responsive design for all devices
- ⚡ **Fast Transactions**: Optimized for Sepolia testnet

## 🚀 Live Demo

**Contract Address**: `0x2B5C509634992c78Ea5103a3401d8F26d2486841`  
**Network**: Sepolia Testnet (Chain ID: 11155111)  
**Etherscan**: [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x2B5C509634992c78Ea5103a3401d8F26d2486841)

## 🛠️ Technology Stack

### Smart Contract
- **Solidity** ^0.8.24
- **FHEVM** for encrypted randomness
- **Hardhat** for development and deployment
- **Ethers.js** for blockchain interaction

### Frontend
- **React** 18.2.0 with **TypeScript**
- **Vite** for fast development
- **Tailwind CSS** for styling
- **FHEVM.js** for encryption/decryption
- **Ethers.js** for wallet integration

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet
- Sepolia testnet ETH

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Vickeesh/fhevm-coinflip.git
cd fhevm-coinflip
```

### 2. Install Dependencies

```bash
# Install all dependencies (root + contracts)
npm run install:all
```

### 3. Environment Setup

Create a `.env` file in the `fhevm-contracts` directory:

```env
# Sepolia Testnet Configuration
SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
SEPOLIA_PRIVATE_KEY=your_private_key_here
```

### 4. Deploy Smart Contract

```bash
# Compile contracts
npm run compile

# Check deployment readiness
cd fhevm-contracts
npm run check:sepolia

# Deploy to Sepolia
npm run deploy:sepolia
```

### 5. Fund the Contract

```bash
# Fund contract with 0.1 ETH
cd fhevm-contracts
npm run fund
```

### 6. Start Frontend

```bash
# From root directory
npm run dev
```

Visit `http://localhost:3000/` to use the dApp!

## 🚀 Deploy to Vercel

Deploy your own instance in minutes:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vickeesh/fhevm-coinflip)

### Quick Deployment Steps:

1. Click the "Deploy" button above
2. Connect your GitHub account
3. Configure environment variables:
   - `VITE_NETWORK=sepolia`
   - `VITE_CHAIN_ID=11155111`
   - `VITE_CONTRACT_ADDRESS=0x2B5C509634992c78Ea5103a3401d8F26d2486841`
   - `VITE_RPC_URL=https://ethereum-sepolia.publicnode.com`
   - `VITE_FHEVM_GATEWAY_URL=https://gateway.sepolia.zama.ai`
4. Click "Deploy"

That's it! Your dApp will be live in minutes.

## 🎮 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and approve the connection
2. **Switch to Sepolia**: Ensure you're on Sepolia testnet
3. **Choose Side**: Select Heads or Tails
4. **Set Bet Amount**: Choose between 0.001 - 0.025 ETH
5. **Place Bet**: Click "Place Bet & Flip" to play
6. **Withdraw Winnings**: Use the withdraw button to claim rewards

## 🔐 FHEVM Features

### Encrypted Randomness
- Uses `FHE.randEuint8()` for secure random number generation
- Homomorphic operations for encrypted comparisons
- Privacy-preserving game resolution
- Verifiable fairness through encrypted data

### Security Benefits
- **Provably Fair**: Randomness is generated on-chain with encryption
- **Transparent**: All game logic is publicly verifiable
- **Private**: Player choices and results remain encrypted
- **Tamper-proof**: No way to manipulate outcomes

## 📊 Contract Details

- **Min Bet**: 0.001 ETH
- **Max Bet**: 0.025 ETH
- **House Edge**: 2%
- **Payout**: 1.98x on wins (after house edge)
- **Network**: Sepolia Testnet

## 🛡️ Security Features

- **Input Validation**: Comprehensive bet amount and balance checks
- **Error Handling**: Professional error management with retry logic
- **Network Validation**: Ensures correct network connection
- **Gas Optimization**: Efficient contract design for low gas costs

## 📱 Mobile Support

The dApp is fully responsive and optimized for:
- 📱 Mobile phones (iOS/Android)
- 📱 Tablets (iPad/Android tablets)
- 💻 Desktop computers
- 🖥️ Large screens

## 🔧 Development

### Project Structure

```
fhevm-coinflip-game/
├── fhevm-contracts/     # Smart contracts workspace
│   ├── contracts/
│   │   └── FHECoinFlip.sol
│   ├── deploy/          # Deployment scripts
│   ├── test/            # Contract tests
│   ├── hardhat.config.js
│   └── package.json
├── src/                 # Frontend source
│   ├── components/
│   ├── contracts/
│   ├── types/
│   ├── utils/
│   └── App.tsx
├── index.html
├── vite.config.ts
└── package.json
```

### Available Scripts

```bash
# Root commands
npm run dev              # Start frontend dev server
npm run build            # Build for production
npm run compile          # Compile smart contracts
npm run test             # Run contract tests
npm run deploy:sepolia   # Deploy to Sepolia

# Contract commands (from fhevm-contracts/)
cd fhevm-contracts
npm run check:sepolia    # Check deployment readiness
npm run deploy:sepolia   # Deploy contract
npm run fund             # Fund contract
npm run verify           # Verify deployment
```
# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Fund contract
npx hardhat run scripts/fund-contract.js --network sepolia

# Start frontend (TypeScript)
cd frontend && npm run dev
```

## 🧪 Testing

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/FHECoinFlip.test.ts
```

## 📈 Performance

- **Fast Loading**: Optimized bundle size with Vite
- **Smooth Animations**: 60fps animations and transitions
- **Quick Transactions**: Optimized gas usage
- **Responsive Design**: Works on all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama**: For the FHEVM technology
- **Hardhat**: For the development framework
- **Ethers.js**: For blockchain interaction
- **React**: For the frontend framework
- **Tailwind CSS**: For styling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Vickeesh/fhevm-coinflip/issues) page
2. Create a new issue with detailed information

## 🔗 Links

- **GitHub Repository**: https://github.com/Vickeesh/fhevm-coinflip
- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Sepolia Faucet**: https://sepoliafaucet.com/

---

**⚠️ Disclaimer**: This is a demonstration project for educational purposes. Please gamble responsibly and only use testnet funds.