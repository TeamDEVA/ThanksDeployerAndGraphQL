const hre = require("hardhat");
const { ethers, upgrades } = require('hardhat');
const ChangeEnvAddress = require('../API/utils/changeEnvAddress.js');
require('dotenv').config({ path: '.env' });
const fs = require('fs');

const networks = {'testnet': 'THANKS_ADDRESS_POLYGON',
                  'mainnet': 'THANKS_ADDRESS_MAINNET',
                  'ganache': 'THANKS_ADDRESS_GANACHE'
};
  async function main() {
  let thanksPay2 = await ethers.getContractFactory('ThanksPay2');
  let thanks = await thanksPay2.deploy();
  console.log({"ThanksPay2 deployed to:": thanks.address});
  let changeEnvAddress = new ChangeEnvAddress();
    await changeEnvAddress.change(
        [networks[hre.network.name]], 
        [thanks.address]);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
