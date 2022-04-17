const hre = require("hardhat");
const { ethers, upgrades } = require('hardhat');

async function main() {
  let thanksPay2 = await ethers.getContractFactory('ThanksPay2');
  let thanks = await thanksPay2.deploy();
  console.log({"ThanksPay2 deployed to:": thanks.address});
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
