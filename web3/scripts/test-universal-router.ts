import { ethers } from "ethers";
import IndexLibVault from "../artifacts/contracts/IndexLibVault.sol/IndexLibVault.json";
import UniversalRouterAdapter from "../artifacts/contracts/adapters/UniversalRouterAdapter.sol/UniversalRouterAdapter.json";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);

  // Contract addresses (replace with your deployed addresses)
  const vaultAddress = "0x00Cd190d72fa995C5C4C4628105157d02d8ba125";
  const adapterAddress = "0x85D0Ce05a940d0d24906D6BED0f913E1162b1AED";
  
  // Token addresses
  const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  const WETH = "0x4200000000000000000000000000000000000006";
  const WBTC = "0x9BF058E1EDc025770CcEB47196278ce0f59f85da";

  // Create contract instances
  const vault = new ethers.Contract(vaultAddress, IndexLibVault.abi, wallet);
  const adapter = new ethers.Contract(adapterAddress, UniversalRouterAdapter.abi, wallet);

  console.log("=== Universal Router Integration Test ===");
  console.log("Vault address:", vaultAddress);
  console.log("Adapter address:", adapterAddress);
  console.log("Deployer address:", wallet.address);

  // Test 1: Check if adapter is properly set in vault
  const vaultAdapter = await vault.swapAdapter();
  console.log("\n1. Vault's swap adapter:", vaultAdapter);
  console.log("   Expected:", adapterAddress);
  console.log("   Status:", vaultAdapter === adapterAddress ? "✅ Correct" : "❌ Incorrect");

  // Test 2: Check Universal Router address in adapter
  const universalRouter = await adapter.universalRouter();
  console.log("\n2. Adapter's Universal Router:", universalRouter);
  console.log("   Expected: 0x492e6456d9528771018deb9e87ef7750ef184104");
  console.log("   Status:", universalRouter === "0x492e6456d9528771018deb9e87ef7750ef184104" ? "✅ Correct" : "❌ Incorrect");

  // Test 3: Check token addresses in vault
  const vaultUSDC = await vault.USDC();
  const vaultWETH = await vault.WETH();
  const vaultWBTC = await vault.WBTC();
  
  console.log("\n3. Vault token addresses:");
  console.log("   USDC:", vaultUSDC);
  console.log("   WETH:", vaultWETH);
  console.log("   WBTC:", vaultWBTC);

  // Test 4: Check if deployer is the updater
  const updater = await vault.updater();
  console.log("\n4. Vault updater:", updater);
  console.log("   Expected:", wallet.address);
  console.log("   Status:", updater === wallet.address ? "✅ Correct" : "❌ Incorrect");

  console.log("\n=== Test Complete ===");
  console.log("\nNext steps:");
  console.log("1. Fund the deployer wallet with USDC");
  console.log("2. Call vault.updatePrices() to set initial prices");
  console.log("3. Test vault.deposit() to see Universal Router in action");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 