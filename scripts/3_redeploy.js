const hre = require("hardhat");
const { ethers } = require('hardhat');
const fetch = require("node-fetch-commonjs");
const thanksEthereumClass = require('../API/thanksEthereum.js');
const ChangeEnvAddress = require('../API/utils/changeEnvAddress.js');
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
    let response = await fetch('http://localhost:8000/subgraphs/name/realint2k/int2kthanks', {
    method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data
    })
    let jsonResponse = await response.json();
    let partners = jsonResponse.data.partners;
    console.log("can it load partners?? : ", partners);
    const mainnetProvider = new ethers.providers.JsonRpcProvider(process.env.mainnetRPC);
    const mainnetPrivateKey = process.env.MAINNET_PRIVATE_KEY;
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
    let writer = new Writer();
    /*
    newPartner(uint256 partnerId, 
        string memory partnerEmail, 
        uint256 balance, 
        uint256 lastPayday, 
        uint256 nextPayday, 
        string memory partnerLicenseId, 
        string memory partnerHashData) 
    */ 
    for(let i = 0; i < partners.length; ++i)
    {
        let partner = partners[i];
        let balance = partner.balance;
        let partnerEmail = partner.email;
        let partnerId = partner.id;
        let lastPayDay = partner.lastPayday;
        let nextPayday = partner.nextPayday;
        let partnerHashData = partner.registrationHash;
        let partnerLicenseId = partner.partnerLicenseId;
        let status = partner.status;
        let res = await writer.write(
            "newPartner", 
            [partnerId, partnerEmail, balance, lastPayDay, nextPayday, partnerLicenseId, partnerHashData]
        );
        console.log({
            "reRegisteringForPartner": partnerId,
            "status" : res
        });
    }
    
    /*
    newEmployee(uint256 workerId, 
        uint256 partnerId, 
        string memory workerEmail, 
        string memory workerHashData, 
        uint256 monthlyFullWage)
    */
    for(let i = 0; i < partners.length; ++i)
    {
        let partner = partners[i];
        let employees = partner.employees;
        for(let j = 0; j < employees.length; ++j)
        if(employees[j].status === true)
        {
            let employee = employees[j];
            let workerId = employee.id;
            let partnerId = partner.id;
            let workerEmail = employee.email;
            let workerHashData = employee.registrationHash;
            let status = employee.status;
            let monthlyFullWage = employee.monthlyWage;
            let res = await writer.write(
                "newEmployee",
                [workerId, partnerId, workerEmail, workerHashData, monthlyFullWage]
            );

            console.log({
                "reRegisteringForEmployee": workerId,
                "status" : res
            });
        }
    }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
