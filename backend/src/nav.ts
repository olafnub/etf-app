import { getPrices } from "./prices";

export async function calculateNAV(holdings: {BTC: number, ETH: number}) {
  const prices = await getPrices();
  const nav = holdings.BTC * prices.BTC + holdings.ETH * prices.ETH;
  
  return { nav, prices };
}
