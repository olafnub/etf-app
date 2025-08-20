import { getPrices } from "./utils/prices";

export async function calculateNAV(holdings: {BTC: number, ETH: number}) {

  const holdingSymbols = Object.keys(holdings)
  // Asset prices
  const prices = await getPrices(holdingSymbols);

  // NAV = total USD value of all assets / total ETF token supply. Ex: Asset = BTC + ETH prices
  // Token Supply, ERC-20 with mint/burn based on NAV
  const tokenSupply = 2000 // TODO: Call an api to get this?
  const nav = (holdings.BTC * prices.BTC + holdings.ETH * prices.ETH) / tokenSupply;
  
  return { nav, prices };
}
