import layer1 from "../placeholder/layer1.json";
import cmc100 from "../placeholder/cmc100.json";

const COINMARKETURL = "https://pro-api.coinmarketcap.com";

export interface Token {
  id: number;
  symbol: string;
  name: string;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
    };
  };
}

export async function fetchLayer1Tokens(): Promise<Token[]> {
  try {
    const LATEST_RESPONSE = await fetch(COINMARKETURL + '/v1/cryptocurrency/listings/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': `${process.env.NEXT_PUBLIC_COINMARKETCAP_API}`,
      }
    });

    const data2 = await LATEST_RESPONSE.json();
    const CMC100_LATEST = data2.data;
    // console.log(CMC100_LATEST[0])

    const LAYER1_TOKENS = CMC100_LATEST.filter((token: any) => token.tags?.includes("layer-1"));
    console.log(LAYER1_TOKENS);
    
    return LAYER1_TOKENS;
  } catch (error) {
    console.error('Error fetching layer 1 tokens:', error);
    return layer1;
  }
}

export async function fetchCMC100Tokens(): Promise<Token[]> {
  try {
    const CMC100_RESPONSE = await fetch(COINMARKETURL + '/v3/index/cmc100-historical', {
      headers: {
        'X-CMC_PRO_API_KEY': `${process.env.NEXT_PUBLIC_COINMARKETCAP_API}`,
      },
    });

    const data = await CMC100_RESPONSE.json();
    const CMC100_INDEX = data.data;
    
    return CMC100_INDEX;
  } catch (error) {
    console.error('Error fetching CMC100 tokens:', error);
    // Transform fallback data to match Token interface
    return cmc100.constituents.map((token: any) => ({
      id: token.id,
      symbol: token.symbol,
      name: token.name,
      quote: {
        USD: {
          price: 0, // Placeholder price
          percent_change_24h: 0 // Placeholder change
        }
      }
    }));
  }
}

// Fallback data
export const FALLBACK_LAYER1 = layer1;
export const FALLBACK_CMC100 = cmc100.constituents.map((token: any) => ({
  id: token.id,
  symbol: token.symbol,
  name: token.name,
  quote: {
    USD: {
      price: 0, // Placeholder price
      percent_change_24h: 0 // Placeholder change
    }
  }
}));