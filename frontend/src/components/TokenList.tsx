import Image from "next/image";
import { TokensDetail } from "../app/util/token";

interface TokenListProps {
  tokens: TokensDetail[];
  title: string;
}

export default function TokenList({ tokens, title }: TokenListProps) {
  return (
    <div className="w-full h-full bg-gray-900 rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-6 text-white">{title}</h3>
      
      <div className="space-y-3">
        {tokens.map((token, index) => (
          <div 
            key={token.symbol} 
            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors border border-gray-700"
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex items-center space-x-2">
                <Image 
                  src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${token.id}.png`}
                  width={30}
                  height={30}
                  alt="token"
                />
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {token.symbol}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {token.name}
                  </p>
                </div>
              </div>
            </div>

            {/* <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src="https://defillama.com/chart/chain/bitcoin?tvl=false&chainTokenPrice=true&theme=dark"
                title="DefiLlama"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "0",
                }}
              ></iframe>
            </div> */}
            
            <div className="text-right">
              <p className="text-lg font-semibold text-white">
                ${token.quote.USD.price.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </p>
              <p className={`text-sm font-medium ${
                token.quote.USD.percent_change_24h >= 0 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {token.quote.USD.percent_change_24h >= 0 ? '+' : ''}{token.quote.USD.percent_change_24h.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}