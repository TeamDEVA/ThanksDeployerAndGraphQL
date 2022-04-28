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
    var query = `{
      employees(first: 5) {
        id
        status
        monthlyWage
        currentBalance
        Withdrawals {
          amount
          time
          employee {
            id
          }
        }
        email
        hashData
      }
      partners(first: 5) {
        id
        status
        blocked
        balance
      }
    }`;
    var data = await thanksEthereum.extendedGraphQuery(query);
    console.log(data.employees.map(employee => {
      console.log("This worker has a wage of "+employee.monthlyWage);
      console.log("This worker has a current balance of "+employee.currentBalance);
      employee.Withdrawals.map(withdrawal => {
        console.log("This worker withdrew "+withdrawal.amount+" at a time "+new Date(withdrawal.time*1000));
      })
    }));
    // data.employees.map(employee => {
    //   console.log(employee.id);
    //   console.log(employee.currentBalance);
    // })
    //console.log(await thanksEthereum.extendedGraphQuery());
  });
});