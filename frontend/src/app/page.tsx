
'use client';

import TokenList from '../components/TokenList';
import TradingGraph from '../components/TradingGraph';
import { useState, useEffect } from 'react';
import { fetchLayer1Tokens, fetchCMC100Tokens, FALLBACK_LAYER1, FALLBACK_CMC100, Token } from './util/token';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'layer1' | 'cmc100'>('layer1');
  // const [layer1Tokens, setLayer1Tokens] = useState<Token[]>(FALLBACK_LAYER1);
  // const [cmc100Tokens, setCmc100Tokens] = useState<Token[]>(FALLBACK_CMC100);
  const [loading, setLoading] = useState(true);

  const layer1Tokens = FALLBACK_LAYER1;
  const cmc100Tokens = FALLBACK_CMC100;

  // useEffect(() => {
  //   const loadTokens = async () => {
  //     try {
  //       const [layer1Data, cmc100Data] = await Promise.all([
  //         fetchLayer1Tokens(),
  //         fetchCMC100Tokens()
  //       ]);
        
  //       setLayer1Tokens(layer1Data);
  //       setCmc100Tokens(cmc100Data);
  //     } catch (error) {
  //       console.error('Error loading tokens:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadTokens();
  // }, []);

  return (
    <main className="min-h-screen p-4 lg:p-6 bg-gray-900">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-screen">
        {/* Token List - 2/5 of the screen on desktop, full width on mobile */}
        <div className="w-full lg:w-2/5 h-1/2 lg:h-full overflow-y-auto">
          {/* Tab Navigation */}
          <div className="flex mb-4 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('layer1')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'layer1'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Layer 1 Tokens
            </button>
            <button
              onClick={() => setActiveTab('cmc100')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'cmc100'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              CMC100 Tokens
            </button>
          </div>
          
          {/* Token List Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white">Loading tokens...</div>
            </div>
          ) : activeTab === 'layer1' ? (
            <TokenList tokens={layer1Tokens} title="Layer 1 Tokens" />
          ) : (
            <TokenList tokens={cmc100Tokens} title="CMC100 Tokens" />
          )}
        </div>


        
        {/* Trading Graph - 3/5 of the screen on desktop, full width on mobile */}
        {/* <div className="w-full lg:w-3/5 h-1/2 lg:h-full">
          <TradingGraph />
        </div> */}
      </div>
    </main>
  );
}
