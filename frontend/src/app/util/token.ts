import layer1 from "../placeholder/layer1.json";
import layer1details from "../placeholder/layer1details.json";
import cmc100 from "../placeholder/cmc100.json";

const COINMARKETURL = "https://pro-api.coinmarketcap.com";

export interface TokensData {
    tokensDetail: TokensDetail[];
    totalMarketCap: number;
    etfValue: number;
    etfPrice: number;
    distribution: ETFConstituent[];
}   

export interface TokensDetail {
  id: number;
  symbol: string;
  name: string;
  tags?: string[];
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
      market_cap: number;
    };
  };
}

export interface ETFConstituent {
  id: number;
  name: string;
  symbol: string;
  url: string;
  weight: number;
  price: number;
  market_cap: number;
}

export async function fetchLayer1Data(): Promise<TokensData> {
    const LATEST_RESPONSE = await fetch(COINMARKETURL + '/v1/cryptocurrency/listings/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': `${process.env.NEXT_PUBLIC_COINMARKETCAP_API}`,
      }
    });

    const data2 = await LATEST_RESPONSE.json();
    const CMC100_LATEST = data2.data;
    // console.log(CMC100_LATEST[0])

    const LAYER1_TOKENS = CMC100_LATEST.filter(
        (token: TokensDetail) => token.tags?.includes("layer-1")
      );
      
    const calculateTotalMarketCap = LAYER1_TOKENS.reduce(
        (sum: number, token: TokensDetail) => sum + (token.quote?.USD?.market_cap || 0),
        0
    );

    // Calculate ETF distribution and price
    const distribution: ETFConstituent[] = LAYER1_TOKENS.map((token: TokensDetail) => ({
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      url: `https://coinmarketcap.com/currencies/${token.name.toLowerCase().replace(/\s+/g, '-')}`,
      weight: calculateTotalMarketCap > 0 ? (token.quote?.USD?.market_cap || 0) / calculateTotalMarketCap * 100 : 0,
      price: token.quote?.USD?.price || 0,
      market_cap: token.quote?.USD?.market_cap || 0
    }));

    // Sort by weight (descending)
    distribution.sort((a, b) => b.weight - a.weight);

    // Calculate ETF value and price
    const etfValue = distribution.reduce((sum, constituent) => sum + constituent.weight, 0);
    const etfPrice = distribution.reduce((sum, constituent) => sum + (constituent.price * constituent.weight / 100), 0);
    
    return {
      tokensDetail: LAYER1_TOKENS,
      totalMarketCap: calculateTotalMarketCap,
      etfValue: etfValue,
      etfPrice: etfPrice,
      distribution: distribution
    };
} 
// Fallback data
export const FALLBACK_LAYER1 = layer1;
export const FALLBACK_LAYER1DETAILS = layer1details;
export const FALLBACK_CMC100 = cmc100;