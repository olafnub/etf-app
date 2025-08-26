// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// interface ISwapAdapter {
//     function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut);
// }

// contract IndexVault is ReentrancyGuard, Ownable {
//     using SafeERC20 for IERC20;

//     uint16 public constant BPS = 10000;

//     IERC20 public immutable USDC;
//     IERC20 public immutable WETH;
//     IERC20 public immutable WBTC;

//     ISwapAdapter public swapAdapter;

//     uint16 public targetWbtcBps;
//     uint16 public targetWethBps;

//     mapping(address => uint256) public balanceOf;
//     uint256 public totalSupply;

//     // -------- Events --------
//     event Deposit(address indexed user, uint256 usdcIn, uint256 sharesOut, uint256 wbtcBought, uint256 wethBought);
//     event Withdraw(address indexed user, uint256 sharesIn, uint256 wethOut, uint256 wbtcOut);
//     event SwapAdapterUpdated(address newAdapter);
//     event TargetsUpdated(uint16 wbtcBps, uint16 wethBps);

//     constructor(address _usdc, address _weth, address _wbtc, address _swapAdapter) Ownable(msg.sender) {
//         require(_usdc != address(0) && _weth != address(0) && _wbtc != address(0), "bad token");
//         require(_swapAdapter != address(0), "bad adapter");
//         USDC = IERC20(_usdc);
//         WETH = IERC20(_weth);
//         WBTC = IERC20(_wbtc);
//         swapAdapter = ISwapAdapter(_swapAdapter);

//         // default: 50/50
//         targetWbtcBps = 5000;
//         targetWethBps = 5000;
//     }

//     // -------- Core Logic --------

//     function deposit(uint256 usdcAmount) external nonReentrant {
//         require(usdcAmount > 0, "zero deposit");
//         USDC.safeTransferFrom(msg.sender, address(this), usdcAmount);

//         uint256 halfWbtc = (usdcAmount * targetWbtcBps) / BPS;
//         uint256 halfWeth = (usdcAmount * targetWethBps) / BPS;

//         uint256 wbtcBought = swapAdapter.swap(address(USDC), address(WBTC), halfWbtc);
//         uint256 wethBought = swapAdapter.swap(address(USDC), address(WETH), halfWeth);

//         uint256 shares = usdcAmount; // 1:1 for simplicity, could use NAV
//         balanceOf[msg.sender] += shares;
//         totalSupply += shares;

//         emit Deposit(msg.sender, usdcAmount, shares, wbtcBought, wethBought);
//     }

//     function withdraw(uint256 shares) external nonReentrant {
//         require(shares > 0 && shares <= balanceOf[msg.sender], "bad shares");

//         balanceOf[msg.sender] -= shares;
//         totalSupply -= shares;

//         uint256 wethBal = WETH.balanceOf(address(this));
//         uint256 wbtcBal = WBTC.balanceOf(address(this));
//         uint256 supplyBeforeBurn = totalSupply + shares;

//         uint256 userWeth = (wethBal * shares) / supplyBeforeBurn;
//         uint256 userWbtc = (wbtcBal * shares) / supplyBeforeBurn;

//         WETH.safeTransfer(msg.sender, userWeth);
//         WBTC.safeTransfer(msg.sender, userWbtc);

//         emit Withdraw(msg.sender, shares, userWeth, userWbtc);
//     }

//     // -------- Admin --------

//     function setSwapAdapter(address a) external onlyOwner {
//         require(a != address(0), "bad adapter");
//         swapAdapter = ISwapAdapter(a);
//         emit SwapAdapterUpdated(a);
//     }

//     function setTargets(uint16 wbtcBps, uint16 wethBps) external onlyOwner {
//         require(wbtcBps + wethBps == BPS, "sum!=100%");
//         targetWbtcBps = wbtcBps;
//         targetWethBps = wethBps;
//         emit TargetsUpdated(wbtcBps, wethBps);
//     }
// }
