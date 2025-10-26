import React from 'react';
import { LogOut, Wallet } from 'lucide-react';

interface WalletDisconnectDemoProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  walletAddress: string;
  balance: string;
}

// Demo component to show the disconnect functionality
const WalletDisconnectDemo: React.FC<WalletDisconnectDemoProps> = ({ 
  isConnected, 
  onConnect, 
  onDisconnect, 
  walletAddress, 
  balance 
}) => {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Wallet className="w-5 h-5" />
        Wallet Connection Demo
      </h3>
      
      {!isConnected ? (
        <div className="text-center">
          <p className="text-slate-400 mb-4">No wallet connected</p>
          <button
            onClick={onConnect}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Connected Address</div>
            <div className="text-sm font-mono text-white break-all">
              {walletAddress}
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Balance</div>
            <div className="text-lg font-semibold text-white">
              {balance} ETH
            </div>
          </div>
          
          <button
            onClick={onDisconnect}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletDisconnectDemo;
