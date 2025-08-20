import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// minimal ABI example
const abi = [
  "function updateNAV(uint256 newNAV) public",
  "function mint(address to, uint256 amount) public",
  "function burn(address from, uint256 amount) public"
];

const etf = new ethers.Contract(process.env.ETF_CONTRACT!, abi, wallet);

export async function pushNAV(nav: number) {
  const tx = await etf.updateNAV(Math.floor(nav * 1e18));
  console.log("Updating NAV tx:", tx.hash);
  await tx.wait();
}
