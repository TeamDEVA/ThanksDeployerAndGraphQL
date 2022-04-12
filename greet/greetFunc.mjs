import hardhat from "hardhat";
import dotenv from "dotenv";
dotenv.config();

export async function greet() {
  const provider = new hardhat.ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com/");      
  const signerTmp = hardhat.ethers.Wallet.fromMnemonic(process.env.MNEMONIC).connect(provider);
  const address = "0x43a35f6D0AEA7bdcD07E12aA4769353241ef1433";
  const abi = [
    "function greet() view returns (string)"
  ];
	const contract = new hardhat.ethers.Contract(address, abi, signerTmp);
	const result = await contract.functions.greet();

	console.log("result", result);
}