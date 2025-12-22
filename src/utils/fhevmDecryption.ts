import { ethers } from 'ethers';
import { createInstance, FhevmInstance } from 'fhevmjs';

/**
 * FHEVM v0.9 Public Decryption Utility
 * Handles off-chain decryption using the self-relaying model
 */

export interface DecryptionResult {
  cleartext: number;
  proof: string;
}

/**
 * Perform public decryption using FHEVM v0.9 self-relaying
 * @param fhevmInstance - The initialized FHEVM instance
 * @param contractAddress - The contract address
 * @param ciphertextHandle - The ciphertext handle to decrypt
 * @returns Decrypted value and proof
 */
export async function publicDecrypt(
  fhevmInstance: FhevmInstance,
  contractAddress: string,
  ciphertextHandle: bigint
): Promise<DecryptionResult> {
  try {
    console.log('Starting public decryption...');
    console.log('Contract:', contractAddress);
    console.log('Ciphertext handle:', ciphertextHandle.toString());

    // Use fhevmjs's public decrypt functionality
    // The instance should have the decrypt method available
    const result = await (fhevmInstance as any).decrypt(contractAddress, ciphertextHandle);
    
    console.log('Decryption successful:', result);
    
    return {
      cleartext: Number(result),
      proof: '0x' // Proof would come from the relayer in production
    };
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error(`Failed to decrypt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Initialize FHEVM instance for v0.9
 */
export async function initializeFhevmInstance(
  chainId: number,
  networkUrl: string,
  gatewayUrl?: string
): Promise<FhevmInstance | null> {
  try {
    console.log('Initializing FHEVM v0.9 instance...');
    
    const config: any = {
      chainId,
      networkUrl,
    };
    
    if (gatewayUrl) {
      config.gatewayUrl = gatewayUrl;
    }
    
    const instance = await createInstance(config);
    console.log('FHEVM instance initialized successfully');
    
    return instance as FhevmInstance;
  } catch (error) {
    console.warn('FHEVM initialization failed:', error);
    return null;
  }
}
