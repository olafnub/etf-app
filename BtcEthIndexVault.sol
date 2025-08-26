// // contracts/BtcEthIndexVault.sol
// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
// import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// interface AggregatorV3Interface {
//   function latestRoundData() external view returns (uint80,int256,uint256,uint256,uint80);
//   function decimals() external view returns (uint8);
// }

// /** Minimal swap adapter (plug Uniswap/Aerodrome in your adapter impl) */
// interface ISwapAdapter {
//   function swapExactTokensForTokens(
//     address tokenIn,
//     address tokenOut,
//     uint256 amountIn,
//     uint256 minAmountOut,
//     address to
//   ) external returns (uint256 amountOut);
// }

// /**
//  * @title BTC+ETH Index Vault
//  * @notice Deposit USDC -> vault swaps into WETH & WBTC at target weights; mints shares.
//  *         Burn shares -> receive pro-rata WETH/WBTC (or use redeemToUsdc() to swap back).
//  *         NAV from Chainlink BTC/USD & ETH/USD. No rebalancing; weights drift.
//  */
// contract BtcEthIndexVault is ERC20, Ownable, ReentrancyGuard {
//   using SafeERC20 for IERC20;

//   IERC20 public immutable USDC; // 6d
//   IERC20 public immutable WETH; // 18d
//   IERC20 public immutable WBTC; // 8d

//   AggregatorV3Interface public immutable BTC_USD; // 1e8
//   AggregatorV3Interface public immutable ETH_USD; // 1e8

//   ISwapAdapter public swapAdapter;

//   // target weights in bps (e.g., 5000 = 50%)
//   uint16 public targetWbtcBps = 5000;
//   uint16 public targetWethBps = 5000;
//   uint16 public constant BPS = 10_000;

//   uint256 public maxOracleStale = 60 minutes;

//   event Deposit(address indexed user, uint256 usdcIn, uint256 sharesOut, uint256 wbtcBought, uint256 wethBought);
//   event Redeem(address indexed user, uint256 sharesIn, uint256 wbtcOut, uint256 wethOut);
//   event RedeemToUsdc(address indexed user, uint256 sharesIn, uint256 usdcOut);
//   event SwapAdapterUpdated(address adapter);
//   event TargetsUpdated(uint16 wbtcBps, uint16 wethBps);
//   event MaxOracleStaleUpdated(uint256 seconds_);

//   constructor(
//     address _usdc,
//     address _weth,
//     address _wbtc,
//     address _btcUsd,
//     address _ethUsd
//   ) ERC20("BTC+ETH Index", "iBTCETH") {
//     require(_usdc != address(0) && _weth != address(0) && _wbtc != address(0), "bad token");
//     require(_btcUsd != address(0) && _ethUsd != address(0), "bad oracle");
//     USDC = IERC20(_usdc);
//     WETH = IERC20(_weth);
//     WBTC = IERC20(_wbtc);
//     BTC_USD = AggregatorV3Interface(_btcUsd);
//     ETH_USD = AggregatorV3Interface(_ethUsd);
//   }

//   // ───────────── Admin ─────────────

//   function setSwapAdapter(address a) external onlyOwner { swapAdapter = ISwapAdapter(a); emit SwapAdapterUpdated(a); }

//   function setTargets(uint16 wbtcBps, uint16 wethBps) external onlyOwner {
//     require(wbtcBps + wethBps == BPS, "sum!=100%");
//     targetWbtcBps = wbtcBps; targetWethBps = wethBps; emit TargetsUpdated(wbtcBps, wethBps);
//   }

//   function setMaxOracleStale(uint256 s) external onlyOwner { maxOracleStale = s; emit MaxOracleStaleUpdated(s); }

//   // ───────────── Oracle utils ─────────────

//   function _price(AggregatorV3Interface f) internal view returns (uint256) {
//     (, int256 ans,, uint256 updated,) = f.latestRoundData();
//     require(ans > 0, "bad price");
//     require(block.timestamp - updated <= maxOracleStale, "stale price");
//     uint8 d = f.decimals();
//     // normalize to 1e8
//     return d == 8 ? uint256(ans) : d < 8 ? uint256(ans) * (10 ** (8 - d)) : uint256(ans) / (10 ** (d - 8));
//   }

//   // Total USD value in 1e16 scale
//   function totalUsdValue16() public view returns (uint256) {
//     uint256 wbtcBal = WBTC.balanceOf(address(this)); // 8d
//     uint256 wethBal = WETH.balanceOf(address(this)); // 18d
//     uint256 btcUsd = _price(BTC_USD); // 1e8
//     uint256 ethUsd = _price(ETH_USD); // 1e8
//     uint256 wbtcVal = wbtcBal * btcUsd;           // 1e16
//     uint256 wethVal = (wethBal * ethUsd) / 1e10;  // 1e16
//     return wbtcVal + wethVal;
//   }

//   // NAV per share (1e8 = $ units)
//   function navPerShare1e8() public view returns (uint256) {
//     uint256 s = totalSupply();
//     if (s == 0) return 1e8; // $1 initial
//     return (totalUsdValue16() / s) / 1e8;
//   }

//   // ───────────── Core flows ─────────────

//   /// @notice Deposit USDC, split by targets, swap to WBTC/WETH, mint shares at NAV.
//   function deposit(uint256 usdcAmount, uint256 minWbtcOut, uint256 minWethOut) external nonReentrant {
//     require(address(swapAdapter) != address(0), "no adapter");
//     require(usdcAmount > 0, "zero");
//     USDC.safeTransferFrom(msg.sender, address(this), usdcAmount);

//     // Approve adapter
//     USDC.approve(address(swapAdapter), usdcAmount);

//     uint256 wbtcInUsdc = usdcAmount * targetWbtcBps / BPS;
//     uint256 wethInUsdc = usdcAmount - wbtcInUsdc;

//     uint256 wbtcOut = 0;
//     uint256 wethOut = 0;

//     if (wbtcInUsdc > 0) {
//       wbtcOut = swapAdapter.swapExactTokensForTokens(address(USDC), address(WBTC), wbtcInUsdc, minWbtcOut, address(this));
//     }
//     if (wethInUsdc > 0) {
//       wethOut = swapAdapter.swapExactTokensForTokens(address(USDC), address(WETH), wethInUsdc, minWethOut, address(this));
//     }

//     // Compute shares
//     uint256 depositUsd16 = (wbtcOut * _price(BTC_USD)) + ((wethOut * _price(ETH_USD)) / 1e10); // 1e16
//     uint256 s = totalSupply();
//     uint256 sharesOut = s == 0 ? (depositUsd16 / 1e8) * 1e10 : (depositUsd16 * 1e10) / navPerShare1e8();

//     _mint(msg.sender, sharesOut);
//     emit Deposit(msg.sender, usdcAmount, sharesOut, wbtcOut, wethOut);
//   }

//   /// @notice Burn shares for pro-rata underlying WBTC/WETH.
//   function redeem(uint256 shares) external nonReentrant {
//     require(shares > 0, "zero");
//     uint256 s = totalSupply();
//     uint256 wbtcBal = WBTC.balanceOf(address(this));
//     uint256 wethBal = WETH.balanceOf(address(this));

//     uint256 wbtcOut = (wbtcBal * shares) / s;
//     uint256 wethOut = (wethBal * shares) / s;

//     _burn(msg.sender, shares);
//     if (wbtcOut > 0) WBTC.safeTransfer(msg.sender, wbtcOut);
//     if (wethOut > 0) WETH.safeTransfer(msg.sender, wethOut);

//     emit Redeem(msg.sender, shares, wbtcOut, wethOut);
//   }

//   /// @notice Burn shares and receive USDC (vault swaps underlying back to USDC).
//   function redeemToUsdc(uint256 shares, uint256 minUsdcOutTotal) external nonReentrant {
//     require(address(swapAdapter) != address(0), "no adapter");
//     require(shares > 0, "zero");

//     uint256 s = totalSupply();
//     uint256 wbtcBal = WBTC.balanceOf(address(this));
//     uint256 wethBal = WETH.balanceOf(address(this));

//     uint256 wbtcSell = (wbtcBal * shares) / s;
//     uint256 wethSell = (wethBal * shares) / s;

//     _burn(msg.sender, shares);

//     if (wbtcSell > 0) {
//       WBTC.approve(address(swapAdapter), wbtcSell);
//       swapAdapter.swapExactTokensForTokens(address(WBTC), address(USDC), wbtcSell, 0, address(this));
//     }
//     if (wethSell > 0) {
//       WETH.approve(address(swapAdapter), wethSell);
//       swapAdapter.swapExactTokensForTokens(address(WETH), address(USDC), wethSell, 0, address(this));
//     }

//     uint256 usdcOut = USDC.balanceOf(address(this));
//     // Safety: transfer only the increment since there may be residuals
//     // For simplicity in MVP, just transfer current balance (run in isolated vault).
//     require(usdcOut >= minUsdcOutTotal, "slippage");
//     USDC.safeTransfer(msg.sender, usdcOut);

//     emit RedeemToUsdc(msg.sender, shares, usdcOut);
//   }
// }
