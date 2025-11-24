'use client';
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';

// Make Buffer available globally for browser compatibility
if (typeof window !== 'undefined' && !window.Buffer) {
  (window as any).Buffer = Buffer;
}

// Default token mints - Change these to swap different tokens
// SOL mint address
const DEFAULT_INPUT_MINT = 'So11111111111111111111111111111111111111112';
// USDC mint address
const DEFAULT_OUTPUT_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Jupiter Ultra Swap API endpoints
const ORDER_API_URL = 'https://lite-api.jup.ag/ultra/v1/order';
const EXECUTE_API_URL = 'https://lite-api.jup.ag/ultra/v1/execute';

export function JupiterSwap() {
  const { publicKey, signTransaction } = useWallet();
  const [amount, setAmount] = useState<string>('0.1'); // Default amount in SOL (0.1 SOL)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [orderData, setOrderData] = useState(null);
  const [token0Usd, setToken0] = useState(0);
  const [token1Usd, setToken1] = useState(0);

  const onInputTokenChange = async (e) => {
    setAmount(e.target.value);

    // Convert amount to native token units (SOL has 9 decimals)
    // Change this decimal value if swapping different tokens
    const amountInNativeUnits = Math.floor(parseFloat(amount) * 1_000_000_000);
    const randomKey = "GXicFxkjeYk6vX4SvBxdVXNKjCzpsFUMvXdA4VGWAChj";

    try {
        // Step 1: Get order from Jupiter Ultra Swap API
        // Change inputMint and outputMint query params to swap different tokens
        let orderUrl;
        if (!publicKey) {
            orderUrl = `${ORDER_API_URL}?` +
            `inputMint=${DEFAULT_INPUT_MINT}&` +
            `outputMint=${DEFAULT_OUTPUT_MINT}&` +
            `amount=${amountInNativeUnits}&` +
            `taker=${randomKey.toString()}`;
        } else {
            orderUrl = `${ORDER_API_URL}?` +
            `inputMint=${DEFAULT_INPUT_MINT}&` +
            `outputMint=${DEFAULT_OUTPUT_MINT}&` +
            `amount=${amountInNativeUnits}&` +
            `taker=${publicKey.toString()}`;
        }
    
        const orderResponse = await fetch(orderUrl);
        const orderData = await orderResponse.json();
        setOrderData(orderData);

        // https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
        const rounded0 = Math.round(orderData.inUsdValue * 100) / 100;
        const rounded1 = Math.round(orderData.outUsdValue * 100) / 100;
        
        setToken0(rounded0);
        setToken1(rounded1);

    } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred during the swap');
    }
  }


  const handleSwap = async () => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 2: Deserialize and sign the transaction
      const transactionBase64 = orderData.transaction;
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(transactionBase64, 'base64')
      );

      // Sign the transaction using the connected wallet
      const signedTransaction = await signTransaction(transaction);
      const signedTransactionBase64 = Buffer.from(signedTransaction.serialize()).toString('base64');

      // Step 3: Execute the swap
      const executeResponse = await fetch(EXECUTE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signedTransaction: signedTransactionBase64,
          requestId: orderData.requestId,
        }),
      });

      const executeData = await executeResponse.json();

      if (executeData.status === 'Success') {
        setSuccess(`Swap successful! View on Solscan: https://solscan.io/tx/${executeData.signature}`);
      } else {
        throw new Error(executeData.error || 'Swap execution failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during the swap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Jupiter Swap</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Amount (SOL)
            {/* Change the label and input handling if swapping different tokens */}
          </label>
          <input
            type="number"
            value={amount}
            onChange={onInputTokenChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
            placeholder="0.1"
            step="0.01"
            min="0"
          />
        </div>

        {token0Usd ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Swapping: SOL ${token0Usd} → USDC ${token1Usd} </p>
            </div>
        ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Swapping: SOL → USDC </p>
            </div>
        )}


        <button
          onClick={handleSwap}
          disabled={loading || !publicKey}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
        >
          {loading ? 'Processing...' : 'Swap'}
        </button>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md text-sm">
            {success}
          </div>
        )}

        {!publicKey && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Please connect your wallet to swap
          </p>
        )}
      </div>
    </div>
  );
}

export default JupiterSwap