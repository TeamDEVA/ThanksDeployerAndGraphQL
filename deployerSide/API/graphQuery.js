const hre = require("hardhat");
const { ethers } = require('hardhat');
const fetch = require("node-fetch-commonjs");
const thanksEthereumClass = require('./thanksEthereum.js');
const ChangeEnvAddress = require('./utils/changeEnvAddress.js');
require('dotenv').config({ path: '.env' });
const fs = require('fs');

async function main() {
    const data = JSON.stringify({
        query: `{
            partners{
              id
              status
              balance
              email
              hashData
              registrationHash
              partnerLicenseId
              nextPayday
              lastPayday
              employees {
                status
                id
                email
                hashData
                registeredSince
                allowedToWithdraw
                totalAllowance
                monthlyWage
                registrationHash
                time
              }
            }
          
          }
          `,
      });
    let response = await fetch('https://api.thegraph.com/subgraphs/id/QmU52D3qYbqP7wJAMuFuT6pBgWXzYHh5TN4wozLMwkvxzo', {
    method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data
    })
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
