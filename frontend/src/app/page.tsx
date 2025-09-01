
'use client';

import TokenList from '../components/TokenList';
import { useState, useEffect } from 'react';
import { 
  fetchLayer1Data, 
  FALLBACK_LAYER1, FALLBACK_LAYER1DETAILS 
} from './util/token';
import { money } from './util/number';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [investmentAmount, setInvestmentAmount] = useState('');

  const layer1Details = FALLBACK_LAYER1DETAILS;
  
  // Calculate distribution based on investment amount
  const calculateDistribution = (amount: number) => {
    if (!amount || amount <= 0) return [];
    
    return layer1Details.distribution.map(token => ({
      ...token,
      investmentAmount: (amount * token.weight) / 100,
      tokenQuantity: (amount * token.weight) / 100 / token.price
    }));
  };

  const distribution = calculateDistribution(parseFloat(investmentAmount) || 0);
  
  useEffect(() => {
    const loadTokens = async () => {
      try {
        // const layer1 = await fetchLayer1Data();
        
        // setLayer1Tokens(layer1);
      } catch (error) {
        console.error('Error loading tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, []);

  return (
    <main className="min-h-screen p-4 lg:p-6 bg-gray-900">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-screen">
        {/* Token List - 2/5 of the screen on desktop, full width on mobile */}
        <div className="w-full lg:w-2/5 h-1/2 lg:h-full overflow-y-auto">
          {/* Tab Navigation */}
          {/* <div className="flex mb-4 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('layer1')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'layer1'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Layer 1
            </button>
          </div> */}
          
          {/* Token List Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white">Loading tokens...</div>
            </div>
          ) : (
            <TokenList tokens={layer1Details.tokensDetail} title="Layer 1 Tokens" />
          )}
        </div>
        
        <div className="w-full lg:w-3/5 h-1/2 lg:h-full">
          <p>Price: ${money(layer1Details.etfPrice)}</p>
          <p>Value: {money(layer1Details.etfValue)}</p>
          <p>Market Cap: {money(layer1Details.totalMarketCap)}</p>
          {/* <TradingGraph /> */}

          {/* Investment Calculator */}
          <div className="mb-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-medium mb-2">Investment Calculator</h3>
            <div className="flex gap-2">
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="Enter investment amount ($)"
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            {/* Distribution Results */}
            {investmentAmount && parseFloat(investmentAmount) > 0 && (
              <div className="mt-4">
                <h4 className="text-white font-medium mb-2">Asset Distribution:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {distribution.slice(0, 10).map((token) => (
                    <div key={token.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{token.symbol}</span>
                        <span className="text-gray-400">({token.weight.toFixed(2)}%)</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white">${money(token.investmentAmount)}</div>
                        <div className="text-gray-400 text-xs">
                          {token.tokenQuantity.toFixed(6)} {token.symbol}
                        </div>
                      </div>
                    </div>
                  ))}
                  {distribution.length > 10 && (
                    <div className="text-gray-400 text-xs text-center pt-2 border-t border-gray-700">
                      +{distribution.length - 10} more assets
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </main>
  );
}
