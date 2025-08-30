// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";

// TODO: The approve(router) step could be optimized slightly (e.g., approve a large allowance once instead of every deposit), but the initial pull from the user is unavoidable.
// TODO: Deposit function: What happens if user tries to deposit WETH, or any other token
// TODO: Withdraw function: Send back USDC instead
// TODO: Find the cheapest routing option instead of sticking to just IUniversalRouter

contract IndexLibVault is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Flow
    // Transfer: User transfers USDC into contract
    // Swap: Contract then swaps the USDC into BTC/ETH
    // Mint: Index tokens and transfer to user

    IERC20 public immutable USDC;
    IERC20 public immutable WETH;
    IERC20 public immutable WBTC;
    IUniversalRouter public immutable uniswapRouter;

    uint256 public wethUsdPrice;
    uint256 public wbtcUsdPrice;

    address public updater;

    constructor (
        address usdc_,
        address weth_,
        address wbtc_,
        address updater_,
        address _uniswapRouter
    ) 
    ERC20("MyIndexTest", "BETH") Ownable(msg.sender)
    {
        require(usdc_ != address(0) && weth_ != address(0) && wbtc_ != address(0), "bad token");
        require(_uniswapRouter != address(0), "bad adapter");
        USDC = IERC20(usdc_);
        WETH = IERC20(weth_);
        WBTC = IERC20(wbtc_);
        uniswapRouter = IUniversalRouter(_uniswapRouter);
        updater = updater_;
    }

    modifier onlyUpdater() {
        require(msg.sender == updater, "Not authorized");
        _;
    }

    // TODO: mapping(address => uint256) public assetPrices; // token -> USDC Price
    // function updatePrices(address token, uint256 price) external onlyUpdater {
    //     require(price > 0, "invalid price");
    //     assetPrices[token] = price;
    // }

    function updatePrices(uint256 wethPrice, uint256 wbtcPrice) external onlyUpdater {
        require(wethPrice > 0 && wbtcPrice > 0, "invalid prices");
        wethUsdPrice = wethPrice;
        wbtcUsdPrice = wbtcPrice;
    }

    function getNavInUSDC(uint256 nav) external onlyUpdater (uint256){
        // uint256 wethValue = WETH.balanceOf(address(this)) * wethUsdPrice;
        // uint256 wbtcValue = WBTC.balanceOf(address(this)) * wbtcUsdPrice;
        // uint256 usdcValue = USDC.balanceOf(address(this));

        // return wethValue + wbtcValue + usdcValue;
        return nav;
    }

    function deposit(uint256 usdcAmount) external nonReentrant {
        // transferFrom user -> contract
        USDC.safeTransferFrom(msg.sender, address(this), usdcAmount);
        
        uint256 halfAmount = usdcAmount / 2;
        
        // encode swap paths
        bytes memory pathWETH = abi.encodePacked(address(USDC), uint24(500), address(WETH));
        bytes memory pathWBTC = abi.encodePacked(address(USDC), uint24(500), address(WBTC));

        // commands (two swaps)
        bytes memory commands = abi.encodePacked(bytes1(uint8(0x00)), bytes1(uint8(0x00)));

        // inputs
        bytes ;
        inputs[0] = abi.encode(address(this), halfAmount, 0, pathWETH, false);
        inputs[1] = abi.encode(address(this), halfAmount, 0, pathWBTC, false);

        uniswapRouter.execute(commands, inputs, block.timestamp);

        // mint index tokens to user
        uint256 indexTokensToMint;

        if (totalSupply() == 0) {
            // first depositor
            indexTokensToMint = usdcAmount;
        } else {
            indexTokensToMint = (usdcAmount * totalSupply() ) / getNavInUSDC(); 
        }
        _mint(msg.sender, indexTokensToMint);
    }

    function withdraw(uint256 indexAmount) external nonReentrant {
        uint256 supplyBeforeBurn = totalSupply();
        _burn(msg.sender, indexAmount);

        uint256 wethBal = WETH.balanceOf(address(this));
        uint256 wbtcBal = WBTC.balanceOf(address(this));

        uint256 userWeth = wethBal * indexAmount / supplyBeforeBurn;
        uint256 userWbtc = wbtcBal * indexAmount / supplyBeforeBurn;

        WETH.safeTransfer(msg.sender, userWeth);
        WBTC.safeTransfer(msg.sender, userWbtc);
    }
}
