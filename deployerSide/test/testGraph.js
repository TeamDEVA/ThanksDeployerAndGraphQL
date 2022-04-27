const { expect } = require("chai");
const { ethers } = require("hardhat");
const thanksEthereumClass = require('../../API/thanksEthereum.js');
const Reader = require('../../API/reader.js');
const { TIMEOUT } = require("dns");

describe("Thanks check", async function () {
  var reader = new Reader();
  var thanksEthereum = new thanksEthereumClass('./API/nonce.txt');

  beforeEach(async function () {
  });

  it("Should register a new partner and set a payday", async function () {
    this.timeout(0);
    //await thanksEthereum.initialize();
    console.log(await thanksEthereum.extendedGraphQuery());
  });

});