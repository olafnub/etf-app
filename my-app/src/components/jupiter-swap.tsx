'use client';
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCcw, ArrowDownUp, Wallet } from 'lucide-react';
import Image from 'next/image';

// Make Buffer available globally for browser compatibility
if (typeof window !== 'undefined' && !window.Buffer) {
  (window as any).Buffer = Buffer;
}

const SwapHeaderUI = () => {
  return (
    <div className="mt-2 h-7 pl-3 pr-2">
        <div className="w-full flex items-center justify-between">
          <div className="flex space-x-1 items-center">
            <Button
              type="button"
              className="p-2 h-7 w-7 flex items-center justify-center rounded-full bg-muted text-foreground fill-current hover:bg-muted/80 transition-colors"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw />
            </Button>
            <div className="text-foreground">
              <Button
                type="button"
                className="py-2 px-3 h-7 flex items-center rounded-2xl text-xs bg-muted text-foreground hover:bg-muted/80 transition-colors"
              >
                <span>Connect Wallet</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
  )
}

const SwitchTokensButtonUI = () => {
  return (
    <div className="relative z-10 -my-3 flex justify-center">
      <div className="flex justify-center bg-background rounded-full">
        <Button 
          className="border-[3px] border-background fill-current text-black bg-muted hover:bg-muted/80 dark:text-foreground dark:hover:border-primary dark:border dark:border-border h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-all"
          onClick={() => {}}
          >
          <ArrowDownUp />
        </Button>
      </div>
    </div>
  )
}

const SellingHeaderUI = () => {
  return (
    <div className="flex justify-between items-center text-xs text-foreground">
      <p>Selling</p>
      <div className="flex space-x-1 text-xs items-center text-muted-foreground fill-current cursor-pointer">
        <Wallet />
        <span>USDC</span>
      </div>
    </div>
  )
}

// Default token mints - Change these to swap different tokens
// SOL mint address: So11111111111111111111111111111111111111112
// USDC mint address
let DEFAULT_INPUT_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// cbBTC mint address
let DEFAULT_OUTPUT_MINT = 'cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij';

// Jupiter Ultra Swap API endpoints
const ORDER_API_URL = 'https://lite-api.jup.ag/ultra/v1/order';
const EXECUTE_API_URL = 'https://lite-api.jup.ag/ultra/v1/execute';

// Token logos
const USDC_LOGO = "https://image.solanatracker.io/proxy?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FEPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v%2Flogo.png";
const CBWBTC_LOGO = "https://ipfs.io/ipfs/QmZ7L8yd5j36oXXydUiYFiFsRHbi3EdgC4RuFwvM7dcqge";

interface OrderData {
  transaction: string;
  requestId: string;
  inUsdValue: number;
  outUsdValue: number;
  outAmount: number;
}

export function JupiterSwap() {
  const { publicKey, signTransaction } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [outputAmount, setOutputAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [token0Usd, setToken0] = useState(0);
  const [token1Usd, setToken1] = useState(0);

  const onInputTokenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // DEFAULT_INPUT_MINT = "So11111111111111111111111111111111111111112"
    setAmount(inputValue);

    if (!inputValue || parseFloat(inputValue) <= 0) {
      setToken0(0);
      setToken1(0);
      setOutputAmount('');
      return;
    }

    // Convert amount to native token units (SOL has 9 decimals)
    // Change this decimal value if swapping different tokens
    let amountInNativeUnits = Math.floor(parseFloat(inputValue) * 1_000_000);

    if (DEFAULT_INPUT_MINT == "So11111111111111111111111111111111111111112") {
      amountInNativeUnits = Math.floor(parseFloat(inputValue) * 1_000_000_000);
    }
    const randomKey = "XicFxkjeYk6vX4SvBxdVXNKjCzpsFUMvXdA4VGWAChj";

    try {
        // Step 1: Get order from Jupiter Ultra Swap API
        // Change inputMint and outputMint query params to swap different tokens
        let orderUrl;
        if (!publicKey) {
            orderUrl = `${ORDER_API_URL}?` +
            `inputMint=${DEFAULT_INPUT_MINT}&` +
            `outputMint=${DEFAULT_OUTPUT_MINT}&` +
            `amount=${amountInNativeUnits}&` +
            `taker=${randomKey}`;
        } else {
            orderUrl = `${ORDER_API_URL}?` +
            `inputMint=${DEFAULT_INPUT_MINT}&` +
            `outputMint=${DEFAULT_OUTPUT_MINT}&` +
            `amount=${amountInNativeUnits}&` +
            `taker=${publicKey.toString()}`;
        }

      // const searchResponse = await fetch(`https://lite-api.jup.ag/ultra/v1/search?query=cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij`);
      // const searchData = await searchResponse.json();
      // console.log(searchData);
      
        const orderResponse = await fetch(orderUrl);
        const orderData = await orderResponse.json();
        setOrderData(orderData);

        // https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
        const rounded0 = Math.round(orderData.inUsdValue * 100) / 100;
        const rounded1 = Math.round(orderData.outUsdValue * 100) / 100;
        
        setToken0(rounded0);
        setToken1(rounded1);
        
        // Calculate output amount (USDC has 6 decimals)
        const outputValue = orderData.outAmount / 1_000_000;
        setOutputAmount(outputValue.toFixed(2));
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred during the swap');
        setToken0(0);
        setToken1(0);
        setOutputAmount('');
    }
  }


  const handleSwap = async () => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    if (!orderData) {
      setError('Please enter an amount first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // console.log("orderData", orderData)
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
        setSuccess(`Swapped ${token0Usd}`);
        // View on Solscan: https://solscan.io/tx/${executeData.signature}
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
    <div className="w-full max-w-md mx-auto">
      <SwapHeaderUI />

      <section className="">
        <div className="h-full flex flex-col items-center justify-center">
          <div className="w-full mt-2 rounded-xl flex flex-col px-2">
            <div className="flex-col">
              {/* Selling Section */}
              <div className="border border-transparent bg-sell-card transition-all py-3 px-4 flex flex-col gap-y-2 group focus-within:border-primary/50 focus-within:shadow-lg rounded-xl">
                <SellingHeaderUI />
                {/* Where drop down should be */}
                <div className="flex">
                  <div>
                    <button
                      type="button"
                      className="py-2 px-3 rounded-lg flex items-center bg-muted text-foreground"
                      disabled
                    >
                      <Image
                        src={USDC_LOGO}
                        alt="USDC"
                        width={20}
                        height={20}
                        className="object-cover rounded-full"
                        style={{ maxWidth: '20px', maxHeight: '20px' }}
                      />
                      <div className="ml-4 mr-2 font-semibold" translate="no">
                        <div className="truncate">USDC</div>
                      </div>
                    </button>
                  </div>
                  <div className="flex flex-col items-end justify-between w-full">
                    <Input
                      id="sellToken"
                      inputMode="decimal"
                      className=""
                      placeholder="0.00"
                      type="text"
                      value={amount}
                      onChange={onInputTokenChange}
                    />
                    <span className="text-xs text-muted-foreground">
                      ${token0Usd > 0 ? token0Usd.toFixed(2) : '0'}
                    </span>
                  </div>
                </div>
              </div>

              <SwitchTokensButtonUI />

              {/* Buying Section */}
              <div className="border border-transparent bg-card transition-all py-3 px-4 flex flex-col gap-y-2 group focus-within:border-primary/50 focus-within:shadow-lg rounded-xl">
                <div className="flex justify-between items-center text-xs text-foreground">
                  <div>Buying</div>
                  <div className="flex space-x-1 text-xs items-center text-muted-foreground fill-current cursor-pointer">
                    <Wallet />
                    <span>CBWBTC</span>
                  </div>
                </div>
                <div className="flex">
                  <div>
                    <button
                      type="button"
                      className="py-2 px-3 rounded-lg flex items-center bg-muted text-foreground hover:bg-muted/80 transition-colors"
                    >
                          <Image
                            src={CBWBTC_LOGO}
                            alt="USDC"
                            width={20}
                            height={20}
                            className="object-cover rounded-full"
                            style={{ maxWidth: '20px', maxHeight: '20px' }}
                          />
                        <div className="ml-4 mr-2 font-semibold" translate="no">
                          <div className="truncate">CBWBTC</div>
                        </div>
                    </button>
                  </div>
                  <div className="flex flex-col items-end justify-between w-full">
                    <Input
                      inputMode="decimal"
                      className="h-[40px] w-full bg-transparent text-foreground text-right font-semibold text-lg placeholder:text-muted-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="0.00"
                      type="text"
                      value={outputAmount}
                      readOnly
                    />
                    <span className="text-xs text-muted-foreground">
                      ${token1Usd > 0 ? token1Usd.toFixed(2) : '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </div>

          {/* Action Button */}
          <div className="w-full px-2">
            <button
              type="button"
              onClick={handleSwap}
              disabled={loading || !publicKey || !amount || parseFloat(amount) <= 0}
              className="rounded-xl relative w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
            >
              <div className="p-5 text-md font-semibold h-full w-full leading-none">
                {loading ? 'Processing...' : !publicKey ? 'Connect Wallet' : 'Swap'}
              </div>
            </button>
          </div>

        {/* Error and Success Messages */}
        {error && (
            <div className="w-full px-2 mt-2">
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
          </div>
        )}

        {success && (
            <div className="w-full px-2 mt-2">
              <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md text-sm">
                {success}
              </div>
            </div>
        )}
        </div>
      </section>
    </div>
  );
}

export default JupiterSwap

// future https://stackoverflow.com/questions/76263506/best-practice-for-onchange-in-useeffect