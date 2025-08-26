import { ethers } from "ethers";
import IndexLibVault from "../artifacts/contracts/IndexLibVault.sol/IndexLibVault.json";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);

  const factory = new ethers.ContractFactory(
    IndexLibVault.abi,
    IndexLibVault.bytecode,
    wallet
  );

  const vault = await factory.deploy(
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e",        // USDC
    "0x4200000000000000000000000000000000000006",        // WETH
    "0x9BF058E1EDc025770CcEB47196278ce0f59f85da",        // WBTC
    wallet.address,  // updater
    "0xAdapter"      // swap adapter
  );

  await vault.waitForDeployment();
  console.log("Vault deployed at:", vault.target);
}
main();