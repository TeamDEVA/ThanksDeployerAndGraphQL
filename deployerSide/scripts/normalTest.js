const { expect } = require("chai");
const { ethers } = require("hardhat");
var path = require('path');
const thanksEthereumClass = require('../API/thanksEthereum.js');
const Reader = require('../API/reader.js');


function getDate(year, month, day) {
  return new Date(Date.UTC(year, month, day)).getTime() / 1000;
}

describe("Thanks check", async function () {
  var mode = 0; // only create
  var id = 18;
  var dateArray = [
    getDate('2022', '3', '6'),
    getDate('2022', '3', '8'),
    getDate('2022', '3', '13'),
    getDate('2022', '3', '20'),
    getDate('2022', '3', '27'),
    getDate('2022', '4', '3'),
    getDate('2022', '4', '6'),
    getDate('2022', '4', '8')
  ];
  var reader = new Reader();
  let noncePath = path.join(__dirname, '/../API/nonce.txt');
  console.log(noncePath);
  var thanksEthereum = new thanksEthereumClass(noncePath);
  thanksEthereum.initialize();
  var firstPayday;
  var blockFrom;
  var hash;

  beforeEach(async function () {
  });

  it("Should register a new partner and set a payday", async function () {
    this.timeout(0);
    await thanksEthereum.initialize();
    firstPayday = dateArray[0];
    blockFrom = dateArray[dateArray.length - 2];
    var result = await thanksEthereum.write("handlePartner", [
      mode, //mode = 0
      id,
      id + "@gmail.com", // email
      10000, //balance
      "0x1231284584958234958239459324859", // partner License Id
      "0x1234567890",
      false]
    );

    console.log("Should register a new partner id ", id, " ", result);

    var result = await thanksEthereum.write("payDay", [
      id,
      firstPayday,
      blockFrom,
      10000]
    );
    console.log("and set a payday", result);
  });

  it("Should register a new employee", async function () {
    this.timeout(0);
    const result = await thanksEthereum.write("handleEmployee", [
      mode,
      id,
      id,
      id+"@gmail.com",
      "0x5e714A21331A2bC941abF45F8Ba974B1B226eBd3",
      350]);
    console.log("Should register a new employee", result);
  });

  for (let i = 0; i <= dateArray.length-1; i++) {
    this.timeout(0);
    it("Fixed payment, checking withdrawal at " + new Date(dateArray[i]/1000), async function () {
      
      var thisDate = dateArray[i];
      var result = await thanksEthereum.read("getWithdrawable", [
        id,
        thisDate]);
        console.log(result);

      //console.log({"Allowance: ": parseInt(result[0]._hex, 16), "Monthly withdrawals: ": parseInt(result[1]._hex, 16)});
      result = await thanksEthereum.write("withdrawMoney", [
        id,
        thisDate,
        40]);

      console.log(result);
    });
  }
});