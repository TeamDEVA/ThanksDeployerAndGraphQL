const hre = require("hardhat");
const { ethers } = require('hardhat');
const fetch = require("node-fetch-commonjs");
const thanksEthereumClass = require('../API/thanksEthereum.js');
const ChangeEnvAddress = require('../API/utils/changeEnvAddress.js');
require('dotenv').config({ path: '.env' });
const fs = require('fs');

async function main() {
    /*
    DEPLOY THE CONTRACTs
    */
    const mainnetProvider = new ethers.providers.JsonRpcProvider(process.env.polygonRPC);
    const mainnetPrivateKey = process.env.POLYGON_PRIVATE_KEY;
    const mainnetWallet = new ethers.Wallet(mainnetPrivateKey, mainnetProvider);
    const ganacheProvider = new ethers.providers.JsonRpcProvider(process.env.ganacheRPC);
    const ganachePrivateKey = process.env.GANACHE_PRIVATE_KEY;
    const ganacheWallet = new ethers.Wallet(ganachePrivateKey, ganacheProvider);
    const contractAbi = await fs.readFileSync('data/abi/ThanksPay2.json').toString();
    const metadata = JSON.parse(contractAbi);

    // Set gas limit and gas price, using the default Ropsten provider
    //const price = ethers.utils.formatUnits(await provider.getGasPrice(), 'gwei')
    //const options = {gasLimit: 100000, gasPrice: ethers.utils.parseUnits(price, 'gwei')}

    const mainnetFactory = await ethers.getContractFactory('ThanksPay2', mainnetWallet);
    const mainnetContract = await mainnetFactory.deploy();
    await mainnetContract.deployed();
    let nonce = parseInt(fs.readFileSync('./API/test.txt', 'utf8'));
    fs.writeFileSync('./API/test.txt', (nonce+1).toString());
    console.log({"ThanksPay2 mainnet deployed to:": mainnetContract.address});
    
    const ganacheFactory = await ethers.getContractFactory('ThanksPay2', ganacheWallet);
    const ganacheContract = await ganacheFactory.deploy();
    await ganacheContract.deployed();
    console.log({"ThanksPay2 ganache deployed to:": ganacheContract.address});

    let changeEnvAddress = new ChangeEnvAddress();
    await changeEnvAddress.change(
        ['THANKS_ADDRESS_MUMBAI', 'THANKS_ADDRESS_MAINNET', 'THANKS_ADDRESS_GANACHE'], 
        [mainnetContract.address, mainnetContract.address, ganacheContract.address]);
    process.env.THANKS_ADDRESS_MUMBAI = mainnetContract.address;
    process.env.THANKS_ADDRESS_MAINNET = mainnetContract.address;
    process.env.THANKS_ADDRESS_GANACHE = ganacheContract.address;
    console.log("proceess.env.ThanksaddrMAINNET", process.env.THANKS_ADDRESS_MAINNET);
    /*DONE */
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
