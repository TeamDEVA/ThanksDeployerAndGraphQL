require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();
require('hardhat-abi-exporter');
const fs = require('fs');
module.exports = {
  defaultNetwork: "matic",
  networks: {
    ganache: {
      url: process.env.ganacheRPC,
      accounts: [process.env.GANACHE_PRIVATE_KEY]
    },
    matic: {
      url: process.env.polygonRPC,
      accounts: [process.env.POLYGON_PRIVATE_KEY]
    },
    hardhat: {
    },
    testnet: {
      url: process.env.polygonRPC,
      accounts: [process.env.POLYGON_PRIVATE_KEY]
    },
    // mainnet: {
    //   url: process.env.mainnetRPC,
    //   accounts: [process.env.MAINNET_PRIVATE_KEY]
    // },
    klaytn: {
      url: "https://api.baobab.klaytn.net:8651/",
      accounts: [process.env.KLAYTN_PRIVATE_KEY]
    }
  },
  abiExporter: {
      path: './data/abi',
      runOnCompile: true,
      clear: true,
      flat: true,
      spacing: 2,
      pretty: false,
  },
  solidity: {
    version: "0.8.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
}
