# USDC/BTC swaps on Base & Solana

This document outlines the requirements and tech stack recommendations for building a Decentralized Exchange that lets users swap USDC for BTC on Solana and WBTC on Base. The backend fetches swap prices from multiple DEX/AMM aggregators and returns the best available price.

Personal Resources: https://github.com/AlmostEfficient/jupiter-swap
---

## Tech Stack

**Frontend**
- **Next.js** (preferred over plain React)
    - Hybrid SSR/SSG for speed and SEO
    - Built-in routing and optimizations
    - Compatible with Web3 tooling
- **Web3 Tools**
    - Wallet: 
        - Now: Solana-Dapp Wallet
        - Future: Create wallet option or Rainbowkit
    - WAGMI, Ethers.js
    - UI library: Chakra UI or MUI

**Backend**
- **Golang**
    - REST API
    - Integrates with DEX APIs (1inch, Uniswap, CoinAPI, BaseSwap, etc.)
    - Handles aggregation logic, caching, analytics, (optional: auth, logging)

---

## APIs to Integrate

- **1inch API** (DEX aggregator, best price quotes, supports Base chain)

---

## Recommended App Flow

1. **User** initiates swap: USDC → WBTC.
2. **Frontend** calls your Golang backend API.
3. **Backend** queries all supported DEX APIs for live quotes/order book.
4. **Backend** selects the best rate, returns to frontend.
5. **Frontend** displays best swap route, executes transaction if user accepts.

---

## Project Steps

1. **Set up Next.js project** with Web3 wallet connection.
2. **Design frontend UI**: swap interface & token information.
3. **Build Golang service** to fetch and aggregate prices from DEX APIs.
4. **Implement and expose API endpoints**: `/api/quote`, `/api/orderbook`, etc.
5. **Integrate smart contract execution** (optional: relayer, backend handles tx).
6. **Deploy and test** with Base testnet/mainnet.

---

## 📚 References

- [1inch API Docs](https://1inch.io/api/)
- [CoinAPI Docs](https://www.coinapi.io/)
- [Uniswap SDK/Subgraph](https://docs.uniswap.org/)
- [WAGMI](https://wagmi.sh/)
- [RainbowKit](https://rainbowkit.com/)
- [Ethers.js](https://docs.ethers.io/)
- [Chakra UI](https://chakra-ui.com/)
- [Base Docs](https://docs.base.org/)

---

**Tip:** Start with the aggregation logic in Golang—test with real API data, and mock responses for rapid frontend development.