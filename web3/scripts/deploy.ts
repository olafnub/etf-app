import { ethers } from "ethers";
import IndexLibVault from "../artifacts/contracts/IndexLibVault.sol/IndexLibVault.json";
import UniversalRouterAdapter from "../artifacts/contracts/adapters/UniversalRouterAdapter.sol/UniversalRouterAdapter.json";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);

  console.log("Deploying Universal Router Adapter...");
  
  // Deploy the Universal Router adapter first
  const adapterFactory = new ethers.ContractFactory(
    UniversalRouterAdapter.abi,
    UniversalRouterAdapter.bytecode,
    wallet
  );

  // Universal Router address on Base Sepolia
  const universalRouterAddress = "0x492e6456d9528771018deb9e87ef7750ef184104";
  
  const adapter = await adapterFactory.deploy(universalRouterAddress);
  await adapter.waitForDeployment();
  console.log("Universal Router Adapter deployed at:", adapter.target);

  console.log("Deploying IndexLibVault...");
  
  // Deploy the vault with the adapter
  const vaultFactory = new ethers.ContractFactory(
    IndexLibVault.abi,
    IndexLibVault.bytecode,
    wallet
  );

  const vault = await vaultFactory.deploy(
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e",        // USDC
    "0x4200000000000000000000000000000000000006",        // WETH
    "0x9BF058E1EDc025770CcEB47196278ce0f59f85da",        // WBTC
    wallet.address,  // updater
    await adapter.getAddress()  // swap adapter
  );

  await vault.waitForDeployment();
  console.log("IndexLibVault deployed at:", vault.target);
}
main();