'use client';
import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet } from 'lucide-react';
import Image from 'next/image';

interface TokenBalance {
  mintAddress: string;
  tickerSymbol: string;
  image: string
  balanceAmount: number;
  decimals: number;
  usdValue: number;
}

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const TOKEN2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const ALL_TOKENS = [];

// Common token mints and their symbols, future cache
const TOKEN_INFO: Record<string, { symbol: string; decimals: number, image: string }> = {
  // 'So11111111111111111111111111111111111111112': { symbol: 'SOL', decimals: 9, image: "https://image.solanatracker.io/proxy?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FSo11111111111111111111111111111111111111112%2Flogo.png" },
  // 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', decimals: 6 },
  // 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', decimals: 6 },
  // 'cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij': { symbol: 'CBWBTC', decimals: 8 },
};

export function BalanceUI() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [solBalance, setSolBalance] = useState<number>(0);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalUsdValue, setTotalUsdValue] = useState<number>(0);
  const [solPrice, setSolPrice] = useState<number>(0);

  const fetchSolPrice = async () => {
      try {
        const token = "So11111111111111111111111111111111111111112";
        const response = await fetch(`https://lite-api.jup.ag/ultra/v1/search?query=${token}`);
        const data = await response.json();
        setSolPrice(data.solana?.usdPrice || 0);
      } catch (err) {
        console.error('Failed to fetch SOL price:', err);
      }
  };

  const fetchBalances = async () => {
    if (!publicKey || !connection) {
      setSolBalance(0);
      setTokenBalances([]);
      setTotalUsdValue(0);
      return;
    }

    setLoading(true);
    try {
      // Fetch SOL balance
      const balance = await connection.getBalance(publicKey);
      const solBalanceLamports = balance / LAMPORTS_PER_SOL;
      setSolBalance(solBalanceLamports);

      const tokens: TokenBalance[] = [];
      
      // Fetch token accounts, SPL & token2022
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      const tokenAccounts2 = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN2022_PROGRAM_ID,
      });

      // Combine both token accounts arrays
      const allTokenAccounts = [
        ...tokenAccounts.value,
        ...tokenAccounts2.value,
      ];

      for (const accountInfo of allTokenAccounts) {
        const parsedInfo = accountInfo.account.data.parsed.info;
        const mintAddress = parsedInfo.mint;
        const balanceAmount = parsedInfo.tokenAmount.uiAmount || 0;

        if (balanceAmount != 0) {
          // Get token price (simplified - using known prices or 0)
          try {
            const tokenSearchResponse = await fetch(`https://lite-api.jup.ag/ultra/v1/search?query=${mintAddress}`);
            const tokenSearchJson = await tokenSearchResponse.json();
            const tokenSearchData = tokenSearchJson[0];
            
            const price = tokenSearchData.usdPrice || 0;
            const usdValue = balanceAmount * price;
            let image = "";
            if (TOKEN_INFO[mintAddress]) {
              image = TOKEN_INFO[mintAddress].image;
            } else {
              image = tokenSearchData.icon;
            }
            const tickerSymbol = tokenSearchData.symbol
            const decimals = tokenSearchData.decimals;

            if (price != 0) {
              tokens.push({
                mintAddress,
                tickerSymbol: tickerSymbol,
                image,
                balanceAmount,
                decimals: decimals,
                usdValue,
              });
            }

          } catch {
            const image = "";
            const usdValue = 0;

            tokens.push({
              mintAddress,
              tickerSymbol: "UND",
              image,
              balanceAmount,
              decimals: 0,
              usdValue,
            });
          }
        }
      }

      // Sort by USD value descending
      tokens.sort((a, b) => b.usdValue - a.usdValue);
      setTokenBalances(tokens);

      // Calculate total USD value
      const solUsdValue = solBalanceLamports * solPrice;
      const tokensUsdValue = tokens.reduce((sum, token) => sum + token.usdValue, 0);
      setTotalUsdValue(solUsdValue + tokensUsdValue);
    } catch (err) {
      console.error('Failed to fetch balances:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch SOL price
  useEffect(() => {
    fetchSolPrice();
  }, []);

  // Fetch balances
  useEffect(() => {
    fetchBalances();

    // Refresh every 30 seconds
    // const interval = setInterval(fetchBalances, 30000);
    // return () => clearInterval(interval);
  }, [publicKey, connection, solPrice]);

  if (!publicKey) {
    return (
      <div className="w-full max-w-md mx-auto p-4 border border-border rounded-xl bg-card">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wallet className="w-4 h-4" />
          <p className="text-sm">Connect wallet to view balances</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 border border-border rounded-xl bg-card">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-1">Portfolio</h2>
        <div className="text-2xl font-bold text-foreground">
          ${totalUsdValue.toFixed(2)}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading balances...</div>
      ) : (
        <div className="space-y-2">
          {/* SOL Balance */}
          {solBalance > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-xs">
                  <Image
                    width={25}
                    height={25}
                    src="https://image.solanatracker.io/proxy?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FSo11111111111111111111111111111111111111112%2Flogo.png"
                    alt="Solana ticker symbol"
                  />
                </div>
                <div>
                  <div className="font-semibold text-foreground">SOL</div>
                  <div className="text-xs text-muted-foreground">{solBalance.toFixed(4)} SOL</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">${(solBalance * solPrice).toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* Token Balances */}
          {tokenBalances.map((token) => (
            <div
              key={token.mintAddress}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-xs">
                  {token.image && (
                    <Image
                      width={25}
                      height={25}
                      src={token.image}
                      alt={token.tickerSymbol}
                    />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{token.tickerSymbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {token.balanceAmount.toFixed(token.decimals > 6 ? 6 : token.decimals)} {token.tickerSymbol}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">${token.usdValue.toFixed(2)}</div>
              </div>
            </div>
          ))}

          {solBalance === 0 && tokenBalances.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No tokens found
            </div>
          )}
        </div>
      )}
    </div>
  );
}