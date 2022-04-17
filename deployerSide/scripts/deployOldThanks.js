const hre = require("hardhat");
const { ethers, upgrades } = require('hardhat');

async function main() {
  let thanksPay2 = await ethers.getContractFactory('OldThanks');
  let thanks = await thanksPay2.deploy();
  console.log({"OldThanks deployed to:": thanks.address});
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});