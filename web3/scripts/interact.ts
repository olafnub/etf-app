// scripts/interact.ts
// Quick TS helpers (mint/redeem)
import { ethers } from "hardhat";

// User calls USDC.approve(indexContract, amount) in TS.

// Then call indexContract.deposit(amount).

// Contract pulls USDC, swaps, and mints index tokens.

const VAULT = process.env.VAULT!; // set after deploy
const USDC = process.env.USDC!;

async function main() {
  const [signer] = await ethers.getSigners();
  const vault = await ethers.getContractAt("BtcEthIndexVault", VAULT);

  // Approve & deposit 2 USDC (6 decimals)
  const usdc = await ethers.getContractAt("IERC20", USDC);
  const amount = ethers.parseUnits("2", 6);
  await (await usdc.connect(signer).approve(VAULT, amount)).wait();

  // minOuts set to 0 for test; set proper slippage in prod
  await (await vault.connect(signer).deposit(amount, 0, 0)).wait();

  const nav1e8 = await vault.navPerShare1e8();
  console.log("NAV (USD):", Number(nav1e8) / 1e8);

  // Redeem half your shares
  const shares = await vault.balanceOf(signer.address);
  await (await vault.connect(signer).redeem(shares / 2n)).wait();
}

main().catch(console.error);
