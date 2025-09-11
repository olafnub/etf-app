
'use client';

import TokenList from '@/components/TokenList';
import { useState, useEffect } from 'react';
import { 
  fetchLayer1Data, 
  FALLBACK_LAYER1, FALLBACK_CMC100, FALLBACK_LAYER1DETAILS 
} from '@/app/util/token';
import { money } from '@/app/util/number';
import TradingGraph from "@/components/TradingGraph";
import { Resend } from 'resend';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportComment, setSupportComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const layer1Details = FALLBACK_LAYER1DETAILS;

  // Calculate distribution based on investment amount
  const calculateDistribution = (amount: number) => {
    return layer1Details.distribution.map(token => ({
      ...token,
      investmentAmount: amount > 0 ? (amount * token.weight) / 100 : 0,
      tokenQuantity: amount > 0 ? (amount * token.weight) / 100 / token.price : 0
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
    <main className="min-h-screen p-4 lg:p-6 bg-gray-900" suppressHydrationWarning>
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
            <div className="flex items-center justify-center">
              <div className="text-white">Loading tokens...</div>
            </div>
          ) : (
            <TokenList tokens={layer1Details.tokensDetail} title="Layer 1" />
          )}
        </div>
        
        <div className="w-full lg:w-3/5 h-1/2 lg:h-full">
          {/* <p>Price: ${money(layer1Details.etfPrice)}</p>
          <p>Value: {money(layer1Details.etfValue)}</p> */}
          {/* <p>Market Cap Combined: {money(layer1Details.totalMarketCap)}</p> */}
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
            <div className="mt-4">
              <h4 className="text-white font-medium mb-2">Asset Distribution:</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {distribution.map((token) => (
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
              </div>
            </div>
          </div>


          {/* Support Modal */}
          {isSupportModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium text-lg">Suggestions or Waitlist</h3>
                  <button
                    onClick={() => setIsSupportModalOpen(false)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="email"
                    // placeholder="Your email address"
                    placeholder="My Api isn't working"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <textarea
                    // placeholder="Share your suggestions, feedback, or report issues..."
                    placeholder="Please dm me on telegram instead @olafnub and I'll try to respond as quickly as possible!"
                    rows={4}
                    value={supportComment}
                    onChange={(e) => setSupportComment(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button 
                                              onClick={async () => {
                          if (!supportEmail || !supportComment) return;
                          setIsSubmitting(true);
                          try {
                            // Send email using Resend
                            const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API);
                            const fromEmail = process.env.NEXT_PUBLIC_FROMEMAIL;
                            const toEmail = process.env.NEXT_PUBLIC_TOEMAIL;

                            await resend.emails.send({
                              from: `${fromEmail}`,
                              to: `${toEmail}`,
                              subject: 'ETF App Feedback',
                              html: `
                                <h2>New Feedback from ETF App</h2>
                                <p><strong>User Email:</strong> ${supportEmail}</p>
                                <p><strong>Comment:</strong></p>
                                <p>${supportComment.replace(/\n/g, '<br>')}</p>
                              `
                            });
                          
                          // Reset form and close modal
                          setSupportEmail('');
                          setSupportComment('');
                          setIsSupportModalOpen(false);
                        } catch (error) {
                          console.error('Error sending feedback:', error);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      disabled={isSubmitting || !supportEmail || !supportComment}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                    </button>
                    <button
                      onClick={() => setIsSupportModalOpen(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* <h3 className="text-2xl font-bold mb-6 text-white">Market Cap Combined: {money(layer1Details.totalMarketCap)}</h3> */}
          {/* <h3 className="text-2xl font-bold mb-6 text-white">Market Cap Combined: $3.2 trillion usd</h3> */}
          <TradingGraph />
          <p className="mb-6">When distributed based on market-cap, Bitcoin outperforms the index which proves it is better to just hold Bitcoin</p>
          {/* Support Button */}
          <div className="mb-4">
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors border border-gray-600"
            >
              💬 Suggestions or Waitlist
            </button>
          </div>
        </div>
        
        
        
      </div>
    </main>
  );
}
