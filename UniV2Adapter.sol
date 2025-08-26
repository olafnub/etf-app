// // contracts/adapters/UniV2Adapter.sol
// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// interface IUniswapV2RouterLike {
//   function swapExactTokensForTokens(
//     uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline
//   ) external returns (uint[] memory amounts);
// }

// import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import {ISwapAdapter} from "../BtcEthIndexVault.sol";
// import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// contract UniV2Adapter is ISwapAdapter {
//   using SafeERC20 for IERC20;
//   IUniswapV2RouterLike public immutable router;

//   constructor(address _router) { router = IUniswapV2RouterLike(_router); }

//   function swapExactTokensForTokens(
//     address tokenIn,
//     address tokenOut,
//     uint256 amountIn,
//     uint256 minAmountOut,
//     address to
//   ) external override returns (uint256 amountOut) {
//     IERC20(tokenIn).safeIncreaseAllowance(address(router), amountIn);
//     address;
//     path[0] = tokenIn; path[1] = tokenOut;
//     uint[] memory amounts = router.swapExactTokensForTokens(
//       amountIn, minAmountOut, path, to, block.timestamp + 600
//     );
//     return amounts[amounts.length - 1];
//   }
// }
