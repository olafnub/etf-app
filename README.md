### ETF for layer 1 blockchain

Started from this [google form](https://docs.google.com/forms/d/e/1FAIpQLSf_AMuiV8nQ_Yi4Ey1Eq30l8RTE0yswDkhbJPOwdB_x8ziTfg/viewform?usp=header)

## Project's Onchain variables _(immutable logic + state storage)_:
### Token custody + accounting
- deposit() (pull USDC, swap, mint index tokens)
- withdraw() (burn index tokens, send assets back)
- _mint(), _burn(), balances → enforced on-chain.
### Updater permissions
- onlyUpdater modifier
- updatePrices() (just stores prices).
### State storage
- wethUsdPrice, wbtcUsdPrice (latest trusted values).
- Token balances (USDC, WETH, WBTC).
- Total supply of your index token.

## Project's Offchain variables _(heavy compute, APIs, or off-chain data)_:
### Fetching external data
- Get WETH/USD, WBTC/USD from Chainlink, CEX APIs, oracles.
- Validate prices across multiple sources if you want safety.
### Pushing prices on-chain
- Call updatePrices(_wethUsd, _wbtcUsd) using the updater address.
- This is the semi-trusted “oracle-like” step.
### NAV + rebalancing logic
- Compute NAV off-chain with more precision (you can expose getNavInUSDC() for simple checks, but heavy math, historical averages, or rebalancing strategy should live in TypeScript).
- Decide when to rebalance portfolio (trigger swaps, etc.) and call contract functions accordingly.
### Automation / scheduling
- Cron jobs or bots that:
    - Periodically call updatePrices().
    - Monitor imbalance and propose rebalancing.
    - Watch deposits/withdrawals to alert users or backtest strategy.

### Resources
1. [Understanding ETF market pricing?](https://www.reddit.com/r/Bogleheads/comments/1g1i120/why_is_marketcapweighting_an_index_fund_the/)
2. [nodejs-backend-architecture-typescript](https://github.com/fifocode/nodejs-backend-architecture-typescript)
3. [create your own erc-20 token](https://youtu.be/-KXNB5fl6II?si=FLhakdfp5ProPQYv)
4. [maybe use to deploy](https://fly.io/)
5. [front-end inspo](https://www.vaneck.com/us/en/investments/onchain-economy-etf-node/overview/)

### Finance Definitions
- TVL = total vault value in USDC terms (BTC + ETH, priced in USDC).
- supply = total index tokens minted.
- NAV = TVL ÷ supply (Net Asset Value per token).

### Solidity
- Memory: TDLR; Temp data that doesn't need to be stored on the blockchain. Using memory just means the parameter is temporary until you assign it to a storage variable. If you omit memory, the code won’t compile — Solidity forces you to specify it. Memory means the string exists only during the execution of the function (temporary, not stored on-chain). For: string, bytes, arrays, structs. uint256, address, bool is not needed
- Storage: TLDR; Data that you want to modify, change, and put on the blockchain
- CallData: TLDR; Use if it's being used to call other functions.
- nonReentrant: Use it for external functions that has safeTransferFrom or safeTransfer. Don't use it on internal functions

#### [For example](https://youtu.be/wOCIhzAuhgs?si=uZwtvAF8aISHC0BW)
```solidity
<!-- Storage, Memory and Calldata -->

struct Person {
    uint8 age;
    string name;
}
mapping(address => Person) public person;
function example() external {
    person[msg.sender] = Person({age: 19, name: "olaf"});

    <!-- Once executed, age is permanently 20 -->
    Person storage storePerson = person[msg.sender];
    storePerson.age = 20;

    <!-- Once executed, name goes back to olaf -->
    Person memory tempPerson = person[msg.sender];
    tempPerson.name = "olafnewb";
} 