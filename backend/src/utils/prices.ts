import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function getPrices(tokens: string[]) {

  const symbolToAssetName: { [key: string]: string } = {
    "BTC": "Bitcoin",
    "ETH": "Ethereum"
  }
  const tokenString = tokens.map(key => symbolToAssetName[key]).join(",")

  const options = {
      method: 'GET',
      url: `https://api.coingecko.com/api/v3/simple/price?ids=${tokenString}&vs_currencies=usd`,
      headers: {accept: 'application/json', 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY}
  }

  const { data } = await axios.request(options)

  return {
    BTC: data.bitcoin.usd,
    ETH: data.ethereum.usd,
  };
}
