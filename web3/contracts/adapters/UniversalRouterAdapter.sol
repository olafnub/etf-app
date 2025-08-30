// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";

interface ISwapAdapter {
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut);
}

contract UniversalRouterAdapter is ISwapAdapter, Ownable {
    using SafeERC20 for IERC20;

    IUniversalRouter public immutable universalRouter;
    
    // Command for V3 swap
    uint8 private constant V3_SWAP = 0x00;

    event SwapExecuted(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

    constructor(address _universalRouter) Ownable(msg.sender) {
        require(_universalRouter != address(0), "Invalid router address");
        universalRouter = IUniversalRouter(_universalRouter);
    }

    function swap(address tokenIn, address tokenOut, uint256 amountIn) external override returns (uint256 amountOut) {
        require(tokenIn != tokenOut, "Same token");
        require(amountIn > 0, "Zero amount");

        // Transfer tokens from caller to this contract
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Approve Universal Router to spend tokens
        IERC20(tokenIn).approve(address(universalRouter), amountIn);

        // Prepare swap command
        bytes memory commands = new bytes(1);
        commands[0] = bytes1(V3_SWAP);

        // Prepare swap input data
        bytes memory inputs = abi.encode(
            address(tokenIn),    // tokenIn
            address(tokenOut),   // tokenOut
            uint24(3000),        // fee tier (0.3%)
            address(this),       // recipient
            block.timestamp + 300, // deadline
            amountIn,            // amountIn
            0,                   // amountOutMinimum (0 for now, should be calculated)
            0                    // sqrtPriceLimitX96
        );

        // Execute swap
        uint256 balanceBefore = IERC20(tokenOut).balanceOf(address(this));
        universalRouter.execute(commands, inputs, 0);
        uint256 balanceAfter = IERC20(tokenOut).balanceOf(address(this));
        
        amountOut = balanceAfter - balanceBefore;
        
        // Transfer output tokens to caller
        if (amountOut > 0) {
            IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
        }

        emit SwapExecuted(tokenIn, tokenOut, amountIn, amountOut);
        return amountOut;
    }

    // Emergency function to recover stuck tokens
    function recoverToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    // Emergency function to recover ETH
    function recoverETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
} 