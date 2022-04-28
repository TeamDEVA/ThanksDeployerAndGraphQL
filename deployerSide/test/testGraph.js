const { expect } = require("chai");
const { ethers } = require("hardhat");
const thanksEthereumClass = require('../API/thanksEthereum.js');
const Reader = require('../API/reader.js');
const { TIMEOUT } = require("dns");

describe("Thanks check", async function () {
  var reader = new Reader();
  var thanksEthereum = new thanksEthereumClass('./API/nonce.txt');

  beforeEach(async function () {
  });

  it("Should read the balance of the employee", async function () {
    this.timeout(0);
    //await thanksEthereum.initialize();
    var data = await thanksEthereum.extendedGraphQuery();
    console.log(data.employees.map(employee => {
      employee.Withdrawals.map(withdrawal => {
        console.log(withdrawal.amount);
      })
    }));
    // data.employees.map(employee => {
    //   console.log(employee.id);
    //   console.log(employee.currentBalance);
    // })
    //console.log(await thanksEthereum.extendedGraphQuery());
  });
});