import React, { useState } from 'react';
import { Wallet, Coins, Shield, LogOut, Activity, History as HistoryIcon, TrendingUp } from 'lucide-react';
import { ethers } from 'ethers';
import { createInstance } from 'fhevmjs';
import CoinFlipABI from './contracts/CoinFlip.json';
import type {
  ContractInfo,
  GameResult,
  GameHistory,
  GameStats,
  ErrorType,
  SuccessType,
  LastGameResult,
  FhevmInstance
} from './types';

export default function CoinFlipDApp() {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0.0');
  const [betAmount, setBetAmount] = useState<string>('0.001');
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [stats, setStats] = useState<GameStats>({ wins: 0, losses: 0, totalWagered: 0 });
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [playerBalance, setPlayerBalance] = useState<string>('0');
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [successType, setSuccessType] = useState<SuccessType>('');
  const [lastGameResult, setLastGameResult] = useState<LastGameResult | null>(null);
  const [fhevmInstance, setFhevmInstance] = useState<FhevmInstance | null>(null);
  const [isFunding, setIsFunding] = useState<boolean>(false);
  const [fundAmount, setFundAmount] = useState<string>('0.1');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionStep, setConnectionStep] = useState<string>('');
  const [errorType, setErrorType] = useState<ErrorType>('');
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  const connectWallet = async (): Promise<void> => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsLoading(true);
        setIsConnecting(true);
        setError(null);
        setConnectionStep('Requesting wallet access...');

        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        }) as string[];
        
        if (accounts.length === 0) {
          throw new Error('No accounts found. Please connect your wallet.');
        }

        // Create provider and signer
        setConnectionStep('Connecting to network...');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const account = await signer.getAddress();

        // Get balance
        setConnectionStep('Loading account balance...');
        const balance = await provider.getBalance(account);
        const balanceInEth = ethers.formatEther(balance);

        // Load contract info dynamically
        setConnectionStep('Loading contract information...');
        console.log('Loading contract info...');
        
        // Use environment variables for production, fallback to local file for development
        const contractInfoData: ContractInfo = {
          address: import.meta.env.VITE_CONTRACT_ADDRESS || '0x046AE3167Bcc4646155090Fc9b093DD1B3021223',
          network: import.meta.env.VITE_NETWORK || 'sepolia',
          chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '11155111'),
          fhevmEnabled: true
        };
        console.log('Contract info loaded:', contractInfoData);
        
        // Check if we're on the correct network
        setConnectionStep('Verifying network...');
        const network = await provider.getNetwork();
        console.log('Current network:', network);
        
        // Require Sepolia testnet
        if (network.chainId !== 11155111n) {
          throw new Error(`Please switch to Sepolia testnet (Chain ID: 11155111). Current network: ${network.name} (Chain ID: ${network.chainId})`);
        }
        
        if (!contractInfoData.address) {
          throw new Error('Contract not deployed. Please deploy the smart contract first.');
        }

        // Initialize FHEVM instance for Sepolia testnet
        setConnectionStep('Initializing FHEVM...');
        console.log('Initializing FHEVM instance...');
        let fhevmInst: FhevmInstance | null = null;
        
        try {
          // Initialize FHEVM with proper error handling
          fhevmInst = await createInstance({
            chainId: Number(network.chainId),
            networkUrl: import.meta.env.VITE_RPC_URL || 'https://ethereum-sepolia.publicnode.com',
            gatewayUrl: import.meta.env.VITE_FHEVM_GATEWAY_URL || 'https://gateway.sepolia.zama.ai',
          }) as any;
          console.log('FHEVM instance initialized successfully');
        } catch (fhevmError) {
          console.warn('FHEVM initialization failed, trying without gateway:', fhevmError);
          
          // Try without gateway URL
          try {
            fhevmInst = await createInstance({
              chainId: Number(network.chainId),
              networkUrl: import.meta.env.VITE_RPC_URL || 'https://ethereum-sepolia.publicnode.com',
            }) as any;
            console.log('FHEVM instance initialized without gateway');
          } catch (secondError) {
            console.warn('FHEVM completely failed, continuing without FHEVM:', secondError);
            // Continue without FHEVM - the contract will still work with regular randomness
          }
        }
        
        setFhevmInstance(fhevmInst);

        setConnectionStep('Setting up contract connection...');
        let contract: ethers.Contract;
        try {
          console.log('ABI loaded:', CoinFlipABI.abi ? 'Yes' : 'No');
          console.log('ABI length:', CoinFlipABI.abi ? CoinFlipABI.abi.length : 'N/A');
          
          contract = new ethers.Contract(
            contractInfoData.address,
            CoinFlipABI.abi,
            signer
          );
          console.log('Contract created successfully');
          console.log('Contract address:', contractInfoData.address);
        } catch (contractError: any) {
          console.error('Error creating contract:', contractError);
          throw new Error(`Failed to create contract: ${contractError.message}`);
        }

        // Load contract info directly without testing connection first
        setConnectionStep('Loading contract data...');
        console.log('Loading contract info...');
        console.log('Contract address:', contractInfoData.address);
        
        let minBet: bigint, maxBet: bigint, houseEdge: bigint, contractBalance: bigint;
        
        try {
          // Test basic contract connection first
          console.log('Testing basic contract connection...');
          console.log('Contract address:', contractInfoData.address);
          console.log('Network chainId:', network.chainId);
          
          // Try a simple call first
          console.log('Calling owner()...');
          const owner = await contract.owner();
          console.log('Owner result:', owner);
          
          // If owner works, try other functions
          console.log('Calling minBet()...');
          minBet = await contract.minBet();
          console.log('Min bet result:', minBet);
          
          console.log('Calling maxBet()...');
          maxBet = await contract.maxBet();
          console.log('Max bet result:', maxBet);
          
          console.log('Calling houseEdge()...');
          houseEdge = await contract.houseEdge();
          console.log('House edge result:', houseEdge);
          
          console.log('Calling getContractBalance()...');
          contractBalance = await contract.getContractBalance();
          console.log('Contract balance result:', contractBalance);
          
          // Get player balance
          console.log('Getting player balance...');
          const playerBal = await contract.getPlayerBalance(account);
          console.log('Player balance result:', playerBal);
          setPlayerBalance(ethers.formatEther(playerBal));
          
          console.log('Contract info loaded successfully');
        } catch (error: any) {
          console.error('Error loading contract info:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            data: error.data
          });
          throw new Error(`Cannot load contract info: ${error.message}. Make sure you're on Sepolia testnet and contract is deployed.`);
        }

        setWalletAddress(account);
        setWalletConnected(true);
        setBalance(parseFloat(balanceInEth).toFixed(4));
        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setContractInfo({
          address: contractInfoData.address,
          minBet: ethers.formatEther(minBet),
          maxBet: ethers.formatEther(maxBet),
          houseEdge: houseEdge.toString(),
          balance: ethers.formatEther(contractBalance),
          fhevmEnabled: fhevmInst !== null,
          network: contractInfoData.network,
          chainId: contractInfoData.chainId,
        });

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        setConnectionStep('Connection successful!');
        setTimeout(() => {
          setIsConnecting(false);
          setConnectionStep('');
        }, 1000);

      } catch (error: any) {
        console.error('Error connecting wallet:', error);
        setIsConnecting(false);
        setConnectionStep('');
        
        // Categorize and handle different error types
        if (error.code === 4001) {
          showError('wallet', 'Connection rejected by user. Please try again.', true);
        } else if (error.code === -32002) {
          showError('wallet', 'Connection request already pending. Please check your wallet.', true);
        } else if (error.message?.includes('Sepolia')) {
          showError('network', 'Please switch to Sepolia testnet in your wallet and try again.', true);
        } else if (error.message?.includes('Contract not deployed')) {
          showError('contract', 'Smart contract not found. Please contact support.', false);
        } else {
          showError('wallet', `Connection failed: ${error.message}`, true);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet!');
    }
  };

  const handleAccountsChanged = (accounts: string[]): void => {
    if (accounts.length === 0) {
      setWalletConnected(false);
      setWalletAddress('');
      setBalance('0.0');
      setProvider(null);
      setSigner(null);
      setContract(null);
      setContractInfo(null);
    } else {
      setWalletAddress(accounts[0]);
    }
  };

  const handleChainChanged = (): void => {
    window.location.reload();
  };

  const disconnectWallet = (): void => {
    // Reset all wallet-related state
    setWalletConnected(false);
    setWalletAddress('');
    setBalance('0.0');
    setProvider(null);
    setSigner(null);
    setContract(null);
    setContractInfo(null);
    setPlayerBalance('0');
    setFhevmInstance(null);
    
    // Clear game state
    setResult(null);
    setLastGameResult(null);
    setError(null);
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
    
    console.log('Wallet disconnected successfully');
  };

  const showSuccess = (type: SuccessType, message: string): void => {
    setSuccessType(type);
    setSuccessMessage(message);
    setShowSuccessPopup(true);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);
  };

  const showError = (type: ErrorType, message: string, canRetry: boolean = false): void => {
    setErrorType(type);
    setError(message);
    setShowErrorModal(true);
    
    // Auto-hide after 5 seconds if not retryable
    if (!canRetry) {
      setTimeout(() => {
        setShowErrorModal(false);
        setError(null);
      }, 5000);
    }
  };

  const handleRetry = (): void => {
    setRetryCount(prev => prev + 1);
    setShowErrorModal(false);
    setError(null);
    
    // Retry based on error type
    if (errorType === 'wallet') {
      connectWallet();
    } else if (errorType === 'transaction') {
      // Retry the last action (flip coin or withdraw)
      if (isFlipping) {
        flipCoin();
      } else if (isWithdrawing) {
        withdrawBalance();
      }
    }
  };

  const withdrawBalance = async (): Promise<void> => {
    if (!contract || !walletConnected) {
      showError('wallet', 'Please connect your wallet first!', true);
      return;
    }

    if (parseFloat(playerBalance) <= 0) {
      showError('transaction', 'No winnings to withdraw! Play some games first to earn rewards.', false);
      return;
    }

    try {
      setIsWithdrawing(true);
      setError(null);

      console.log('Withdrawing player balance...');
      const tx = await contract.withdrawPlayerBalance();
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('Withdrawal transaction confirmed:', receipt);

      // Update player balance
      const newPlayerBal = await contract.getPlayerBalance(walletAddress);
      setPlayerBalance(ethers.formatEther(newPlayerBal));

      // Update wallet balance
      if (provider) {
        const newBalance = await provider.getBalance(walletAddress);
        setBalance(parseFloat(ethers.formatEther(newBalance)).toFixed(4));
      }

          // Show success popup for withdrawal
          showSuccess('withdraw', `💰 Withdrew ${parseFloat(playerBalance).toFixed(4)} ETH to your wallet!`);

    } catch (err: any) {
      console.error('Error withdrawing balance:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        showError('transaction', 'Withdrawal was rejected by user. Please try again.', true);
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        showError('transaction', 'Insufficient gas for withdrawal. Please add ETH for gas fees.', false);
      } else if (err.message && err.message.includes('No balance to withdraw')) {
        showError('transaction', 'No winnings to withdraw. Play some games first!', false);
      } else {
        showError('transaction', `Withdrawal failed: ${err.message || 'Unknown error'}`, true);
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  const fundContract = async (): Promise<void> => {
    if (!contract || !walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    if (parseFloat(fundAmount) <= 0) {
      alert('Please enter a valid amount to fund!');
      return;
    }

    try {
      setIsFunding(true);
      setError(null);

      console.log('Funding contract...');
      const tx = await contract.fundContract({ value: ethers.parseEther(fundAmount) });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('Funding transaction confirmed:', receipt);

      // Update contract balance
      const contractBalance = await contract.getContractBalance();
      setContractInfo(prev => prev ? {
        ...prev,
        balance: ethers.formatEther(contractBalance),
      } : null);

      // Update wallet balance
      if (provider) {
        const newBalance = await provider.getBalance(walletAddress);
        setBalance(parseFloat(ethers.formatEther(newBalance)).toFixed(4));
      }

      // Show success popup
      showSuccess('fund', `💰 Funded contract with ${parseFloat(fundAmount).toFixed(4)} ETH!`);

    } catch (err: any) {
      console.error('Error funding contract:', err);
      if (err.code === 'ACTION_REJECTED') {
        setError('Funding was rejected by user');
      } else {
        setError(err.message || 'Failed to fund contract');
      }
    } finally {
      setIsFunding(false);
    }
  };


  const flipCoin = async (): Promise<void> => {
    if (!walletConnected || !contract) {
      showError('wallet', 'Please connect your wallet first!', true);
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      showError('transaction', 'Please enter a valid bet amount!', false);
      return;
    }

    const minBet = parseFloat(contractInfo?.minBet || '0');
    const maxBet = parseFloat(contractInfo?.maxBet || '0');
    const betValue = parseFloat(betAmount);

    if (betValue < minBet) {
      showError('transaction', `Minimum bet is ${minBet} ETH. Please increase your bet amount.`, false);
      return;
    }

    if (betValue > maxBet) {
      showError('transaction', `Maximum bet is ${maxBet} ETH. Please decrease your bet amount.`, false);
      return;
    }

    // Check if user has enough balance
    const userBalance = parseFloat(balance);
    if (userBalance < betValue) {
      showError('transaction', `Insufficient wallet balance. You have ${balance} ETH but need ${betAmount} ETH.`, false);
      return;
    }

    // Clear last game result when starting new game
    setLastGameResult(null);
    setResult(null);

    try {
      setIsFlipping(true);
      setResult(null);
      setError(null);

      const betAmountWei = ethers.parseEther(betAmount.toString());
      const choice = selectedSide === 'heads';
      
      console.log('Calling flipCoin with FHEVM:', {
        choice,
        betAmountWei: betAmountWei.toString(),
        betAmountEth: betAmount
      });
      
      // Call smart contract (no encrypted input needed - randomness is generated on-chain)
      const tx = await contract.flipCoin(choice, { value: betAmountWei });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Find the GameResolved event
      const gameResolvedEvent = receipt.logs.find(
        (log: any) => log.fragment && log.fragment.name === 'GameResolved'
      );

      if (gameResolvedEvent) {
        const gameId = gameResolvedEvent.args[0];
        const won = gameResolvedEvent.args[2];
        const payout = gameResolvedEvent.args[3];

        const outcome: 'heads' | 'tails' = won ? selectedSide : (selectedSide === 'heads' ? 'tails' : 'heads');
        const payoutEth = parseFloat(ethers.formatEther(payout));

        const gameResult: GameResult = {
          outcome,
          won,
          payout: payoutEth,
        };

        setResult(gameResult);
        
        // Store the last game result for persistent display
        setLastGameResult({
          won,
          amount: parseFloat(betAmount),
          payout: payoutEth,
          choice: selectedSide,
          result: outcome,
          timestamp: new Date().toLocaleTimeString()
        });
        
        // Show success popup for wins
        if (won) {
          showSuccess('win', `🎉 You won ${payoutEth.toFixed(4)} ETH! (FHEVM Encrypted Randomness)`);
        }
        
        const newHistory: GameHistory[] = [{
          side: selectedSide,
          amount: parseFloat(betAmount),
          outcome,
          won,
          payout: payoutEth,
          timestamp: new Date().toLocaleTimeString()
        }, ...gameHistory].slice(0, 10);
        
        setGameHistory(newHistory);
        
        setStats(prev => ({
          wins: prev.wins + (won ? 1 : 0),
          losses: prev.losses + (won ? 0 : 1),
          totalWagered: prev.totalWagered + parseFloat(betAmount)
        }));

        // Update balance
        if (provider) {
          const newBalance = await provider.getBalance(walletAddress);
          setBalance(parseFloat(ethers.formatEther(newBalance)).toFixed(4));
        }

        // Update player balance
        const newPlayerBal = await contract.getPlayerBalance(walletAddress);
        setPlayerBalance(ethers.formatEther(newPlayerBal));

        // Update contract info
        const contractBalance = await contract.getContractBalance();
        setContractInfo(prev => prev ? {
          ...prev,
          balance: ethers.formatEther(contractBalance),
        } : null);

      } else {
        throw new Error('Game resolution event not found');
      }

      // Reset loading state after successful game completion
      setIsFlipping(false);

    } catch (err: any) {
      console.error('Error flipping coin:', err);
      setIsFlipping(false);
      
      // Categorize transaction errors
      if (err.code === 'ACTION_REJECTED') {
        showError('transaction', 'Transaction was rejected by user. Please try again.', true);
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        showError('transaction', 'Insufficient funds for this bet. Please check your wallet balance.', false);
      } else if (err.message && err.message.includes('Insufficient contract balance')) {
        showError('contract', 'Contract needs more ETH to pay out winnings. Please try a smaller bet.', false);
      } else if (err.message && err.message.includes('transaction execution reverted')) {
        showError('transaction', 'Transaction failed due to contract error. Please try again.', true);
      } else if (err.code === 'UNPREDICTABLE_GAS_LIMIT') {
        showError('transaction', 'Gas estimation failed. Please try again with higher gas limit.', true);
      } else if (err.code === 'NETWORK_ERROR') {
        showError('network', 'Network error. Please check your connection and try again.', true);
      } else {
        showError('transaction', `Transaction failed: ${err.message || 'Unknown error'}`, true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Connection Loading Modal */}
      {isConnecting && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connecting Wallet</h3>
            <p className="text-slate-400 mb-4">{connectionStep}</p>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {errorType === 'wallet' ? 'Wallet Error' :
               errorType === 'network' ? 'Network Error' :
               errorType === 'contract' ? 'Contract Error' :
               errorType === 'transaction' ? 'Transaction Error' : 'Error'}
            </h3>
            <p className="text-slate-300 mb-6 leading-relaxed">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Dismiss
              </button>
              {(errorType === 'wallet' || errorType === 'transaction') && (
                <button
                  onClick={handleRetry}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>Retry</span>
                  {retryCount > 0 && <span className="text-xs">({retryCount})</span>}
                </button>
              )}
            </div>
            {retryCount > 2 && (
              <p className="text-xs text-slate-500 mt-4">
                Having trouble? Try refreshing the page or check your wallet connection.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-2xl max-w-md mx-4 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                successType === 'win' ? 'bg-green-100' : 
                successType === 'withdraw' ? 'bg-blue-100' : 
                'bg-purple-100'
              }`}>
                {successType === 'win' ? (
                  <span className="text-3xl">🎉</span>
                ) : successType === 'withdraw' ? (
                  <span className="text-3xl">💰</span>
                ) : (
                  <span className="text-3xl">💎</span>
                )}
              </div>
              <h3 className="text-xl font-bold mb-2">
                {successType === 'win' ? 'Congratulations!' : 
                 successType === 'withdraw' ? 'Withdrawal Successful!' : 
                 'Contract Funded!'}
              </h3>
              <p className="text-slate-600 mb-6">{successMessage}</p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/20 via-slate-950 to-purple-950/20 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  CoinFlip
                </h1>
                {contractInfo?.fhevmEnabled && (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 px-3 py-1 rounded-full">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-purple-300 font-semibold">FHEVM</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-green-600/20 border border-green-500/30 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-300 font-semibold">Sepolia</span>
                </div>
                {contractInfo && (
                  <div className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-xs text-blue-300 font-semibold">
                      {parseFloat(contractInfo.balance || '0') > 0 ? 'Funded' : 'Unfunded'}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-1">Provably Fair Gaming with Encrypted Randomness</p>
            </div>
          </div>
          
          {!walletConnected ? (
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Wallet className="w-5 h-5 group-hover:animate-pulse" />
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-slate-400 mb-1">Wallet Balance</div>
                <div className="text-xl font-bold text-white">
                  {balance} ETH
                </div>
                {parseFloat(playerBalance) > 0 && (
                  <div className="text-xs text-green-400 mt-1 font-medium">
                    +{parseFloat(playerBalance).toFixed(4)} ETH winnings
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 rounded-xl border border-slate-600">
                    <div className="text-sm font-mono text-slate-200">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="group bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-red-500/25"
                    title="Disconnect Wallet"
                  >
                    <LogOut className="w-4 h-4 group-hover:animate-pulse" />
                    <span className="text-sm font-semibold">Disconnect</span>
                  </button>
                </div>
                {parseFloat(playerBalance) > 0 && (
                  <button
                    onClick={withdrawBalance}
                    disabled={isWithdrawing}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/25"
                  >
                    {isWithdrawing ? 'Withdrawing...' : 'Withdraw Winnings'}
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-8">
            {/* Last Game Result Display */}
            {lastGameResult && (
              <div className={`mb-6 p-6 rounded-2xl border-2 ${
                lastGameResult.won 
                  ? 'bg-green-900/20 border-green-500/50' 
                  : 'bg-red-900/20 border-red-500/50'
              }`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${
                    lastGameResult.won ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {lastGameResult.won ? '🎉 WIN!' : '❌ LOSS'}
                  </div>
                  <div className={`text-3xl font-bold mb-2 ${
                    lastGameResult.won ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {lastGameResult.won 
                      ? `+${lastGameResult.payout.toFixed(4)} ETH`
                      : `-${lastGameResult.amount.toFixed(4)} ETH`
                    }
                  </div>
                  <div className="text-slate-400 text-sm">
                    You chose <span className="font-semibold">{lastGameResult.choice}</span> • 
                    Result: <span className="font-semibold">{lastGameResult.result}</span> • 
                    {lastGameResult.timestamp}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              {/* Game Header */}
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Live Game</h2>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-400">Active</span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Coin Animation Area */}
                <div className="flex justify-center items-center h-64 mb-8 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl border border-slate-700/50 relative overflow-hidden">
                  {/* Animated background particles */}
                  <div className="absolute inset-0">
                    <div className="absolute top-4 left-8 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
                    <div className="absolute top-12 right-12 w-1 h-1 bg-purple-400/40 rounded-full animate-ping"></div>
                    <div className="absolute bottom-8 left-16 w-1.5 h-1.5 bg-green-400/30 rounded-full animate-bounce"></div>
                    <div className="absolute bottom-16 right-8 w-1 h-1 bg-yellow-400/40 rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className={`relative transition-all duration-700 ${isFlipping ? 'animate-spin scale-110' : 'scale-100'}`}>
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 flex items-center justify-center shadow-2xl border-4 border-slate-500 relative">
                      {/* Coin shine effect */}
                      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-white/10 to-transparent"></div>
                      <span className="text-6xl font-bold text-slate-100 relative z-10 drop-shadow-lg">
                        {isFlipping ? '?' : result ? (result.outcome === 'heads' ? 'H' : 'T') : 'Ξ'}
                      </span>
                    </div>
                    
                    {/* Glow effect when flipping */}
                    {isFlipping && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
                    )}
                  </div>
                </div>

                {/* Error Display */}
                {error && !showErrorModal && (
                  <div className="mb-6 p-4 rounded-xl border bg-red-500/10 border-red-500/30 text-red-400">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <span className="text-sm">⚠️</span>
                      </div>
                      <div className="text-sm font-medium">
                        {error}
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Result Display */}
                {result && !isFlipping && (
                  <div className={`mb-6 p-4 rounded-lg border ${
                    result.won 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    <div className="text-center">
                      <div className="text-sm font-medium mb-1">
                        {result.won ? 'Win' : 'Loss'}
                      </div>
                      <div className="text-2xl font-semibold">
                        {result.won ? `+${result.payout.toFixed(4)} ETH` : `-${betAmount} ETH`}
                      </div>
                      <div className="text-xs mt-1 opacity-70">
                        Result: {result.outcome.charAt(0).toUpperCase() + result.outcome.slice(1)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bet Controls */}
                <div className="space-y-6">
                  {/* Side Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Select Side</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSelectedSide('heads')}
                        disabled={isFlipping}
                        className={`group py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 ${
                          selectedSide === 'heads'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-600/30 border-2 border-blue-400'
                            : 'bg-gradient-to-r from-slate-800 to-slate-700 text-slate-300 hover:from-slate-700 hover:to-slate-600 border-2 border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-2xl">🪙</span>
                          <span>Heads</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedSide('tails')}
                        disabled={isFlipping}
                        className={`group py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 ${
                          selectedSide === 'tails'
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-xl shadow-purple-600/30 border-2 border-purple-400'
                            : 'bg-gradient-to-r from-slate-800 to-slate-700 text-slate-300 hover:from-slate-700 hover:to-slate-600 border-2 border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-2xl">🪙</span>
                          <span>Tails</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Bet Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Bet Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        disabled={isFlipping}
                        step="0.001"
                        min="0.001"
                        className="w-full bg-gradient-to-r from-slate-800 to-slate-700 border-2 border-slate-600 rounded-xl px-5 py-4 text-white font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                        placeholder="0.001"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-bold">
                        ETH
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {['0.001', '0.005', '0.01', '0.025'].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setBetAmount(amt)}
                          disabled={isFlipping}
                          className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 ${
                            betAmount === amt
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                              : 'bg-gradient-to-r from-slate-800 to-slate-700 text-slate-300 hover:from-slate-700 hover:to-slate-600 border border-slate-600'
                          }`}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flip Button */}
                  <button
                    onClick={flipCoin}
                    disabled={isFlipping || !walletConnected}
                    className="group w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500 py-4 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:hover:scale-100"
                  >
                    <div className="flex items-center justify-center gap-3">
                      {isFlipping ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Flipping Coin...</span>
                        </>
                      ) : (
                        <>
                          <Coins className="w-5 h-5 group-hover:animate-bounce" />
                          <span>Place Bet & Flip</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Contract Info */}
            {contractInfo && (
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-800/50 px-5 py-3.5 border-b border-slate-700">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Contract Info
                    {contractInfo.fhevmEnabled && (
                      <span className="ml-auto text-xs bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Encrypted
                      </span>
                    )}
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Min Bet</span>
                    <span className="text-sm font-semibold text-white">
                      {parseFloat(contractInfo.minBet || '0').toFixed(4)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Max Bet</span>
                    <span className="text-sm font-semibold text-white">
                      {parseFloat(contractInfo.maxBet || '0').toFixed(4)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">House Edge</span>
                    <span className="text-sm font-semibold text-white">
                      {contractInfo.houseEdge}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-sm text-slate-400">Contract Balance</span>
                    <span className="text-sm font-semibold text-white">
                      {parseFloat(contractInfo.balance || '0').toFixed(4)} ETH
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="bg-slate-800/50 px-5 py-3.5 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Statistics
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Total Games</span>
                  <span className="text-lg font-semibold text-white">{stats.wins + stats.losses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Wins</span>
                  <span className="text-lg font-semibold text-emerald-400">{stats.wins}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Losses</span>
                  <span className="text-lg font-semibold text-rose-400">{stats.losses}</span>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Win Rate</span>
                    <span className="text-lg font-semibold text-white">
                      {stats.wins + stats.losses > 0 
                        ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ 
                        width: stats.wins + stats.losses > 0 
                          ? `${(stats.wins / (stats.wins + stats.losses)) * 100}%` 
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-sm text-slate-400">Total Wagered</span>
                  <span className="text-lg font-semibold text-white">{stats.totalWagered.toFixed(4)} ETH</span>
                </div>
              </div>
            </div>

            {/* Game History */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="bg-slate-800/50 px-5 py-3.5 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4" />
                  Recent Games
                </h3>
              </div>
              <div className="p-3">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {gameHistory.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No games played yet
                    </div>
                  ) : (
                    gameHistory.map((game, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400">
                              {game.side.toUpperCase()} → {game.outcome.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5">
                              {game.timestamp}
                            </span>
                          </div>
                          <span className={`text-sm font-semibold ${
                            game.won ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {game.won ? '+' : '-'}{game.amount.toFixed(4)} ETH
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-500">
            Sepolia Testnet • Provably Fair Gaming
            {contractInfo?.fhevmEnabled && (
              <span className="ml-2 text-purple-400">🔐 Encrypted with FHEVM</span>
            )}
            {!contractInfo?.fhevmEnabled && (
              <span className="ml-2 text-blue-400">⚡ Standard Randomness</span>
            )}
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Contract: {contractInfo?.address || 'Not Connected'} • 
            Please gamble responsibly.
          </p>
        </footer>
      </div>
    </div>
  );
}
