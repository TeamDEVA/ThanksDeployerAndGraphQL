const EthereumHandler = require('./ethereumHandler');
const {updateNonceConditionally, getNonce} = require('./nonceManager');
const fs = require('fs')
const Investigator = require('./investigator');
require('dotenv').config({ path: '../.env' });
const fetch = require("node-fetch-commonjs");
const findMentions = require('./utils/findMentions');
class thanksEthereumClass {
    constructor(nonceLocation) {
        this.nonceLocation = nonceLocation;
        this.mainnetHandler = new EthereumHandler("testnet");
        this.ganacheHandler = new EthereumHandler("ganache");
        this.options = this.mainnetHandler.options;
        this.mainnetContract = this.mainnetHandler.myContract;
        this.ganacheContract = this.ganacheHandler.myContract;
        this.investigator = new Investigator();
    }
    async initialize(){
      await this.mainnetHandler.initializeNonceMainnet("testnet", this.nonceLocation);
    }
    async findMentions(targetEntity, targetField, query, data, getBalance) {
      var my_string = query;
      my_string = my_string.replace(/(\r\n|\n|\r)/gm, "");
      my_string = my_string.replace(/ +(?= )/g, '');
      my_string = my_string.replace("{", "  {");
      my_string = my_string.replace("}", " }");
      my_string = my_string.replace(": ", ":");
      my_string = my_string.replace(" (", "(");
      var salad = my_string.split(" ");
      var before = [];
      var found = [];
      var startSearch = false;
      for (var i = 0; i < salad.length; i += 1) {
          var x = salad[i];
  
          if (x === "{") {
              var word = salad[i - 1];
  
              if (word === "}") {
                  word = "empty";
              }
              if (word) {
                  before.push(word.replace(/ *\([^)]*\) */g, ""));
              }
          }
  
          if (x === "}") {
              before.pop();
          }
  
          if (x.includes(targetEntity)) {
              startSearch = true;
          }
  
          if (startSearch === true) {
              if (x === targetField) {
                  before.push(targetField);
                  let newArray = before.slice();
                  found.push(newArray);
                  before.pop();
              }
          }
      }
      for (var i = 0; i < found.length; i++) {
          console.log("Attempt number " + i);
          await this.recursive(found[i], data);
      }
      // findObjectByLabel(data, 'currentBalance');
      // iterate(data);
      console.log(JSON.stringify(data));
      return found;
  }
  
  async recursive(list, data) {
      var listiq = list.slice();
      var current = list[0];
      listiq.shift();
      if (listiq.length == 0) {
          console.log('listiq is 0, should stop');
          data[current] = await this.getBalance(2); // this line changes the thing ! 
          var id = data[id]; 
          var thing = await this.getBalance(2);
          console.log("Trying to print the thing "+ thing);
      } else {
      console.log('Searching ' + current + ' in ' + JSON.stringify(data));
      if (current.endsWith('s')) {
          for (var i = 0; i < data[current].length; i++) {
              await this.recursive(listiq, data[current][i]);
          }
      } else {
          await this.recursive(listiq, data[current]);
      }
  }
  }
  
  async extendedGraphQuery(){
      const text = `{
        employees(first: 5) {
          id
          status
          currentBalance
          Withdrawals {
            employee {
              currentBalance
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
      const MyQuery = JSON.stringify({
        query: text,
      });
    let response = await fetch('https://api.thegraph.com/subgraphs/name/ollie041114/thanks', {
    method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: MyQuery
    })
    var data = await response.json();
    data = data.data;
    console.log('Getting balance...');
    console.log(await this.getBalance(2));
    var found = await this.findMentions('employee', 'currentBalance', text, data);
    console.log(found);
  }
  async getBalance(id){
    const currentDate = new Date();
    const timestamp = Math.floor(currentDate.getTime());
    var thing = await this.read('getWithdrawable', [
      id, timestamp
    ]);
    return thing;
  }

    async getReceipt(txHash){
      const sleep = (milliseconds) => {
          return new Promise(resolve => setTimeout(resolve, milliseconds));
      }
      const web3 = this.ganacheHandler.web3;
      web3.eth.handleRevert = true;
      var expectedBlockTime = 5*10**2;
      var transactionReceipt;
      while (transactionReceipt == null) {
        // Waiting expectedBlockTime until the transaction is mined
          transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
          await sleep(expectedBlockTime);
      }
      //console.log("Got the transaction receipt: ", transactionReceipt)
      return (transactionReceipt);
  }

    async getErrorLog(information, aFunction){
        //console.log(information);
        const web3 = this.mainnetHandler.web3;
        var errorLog = "Success";
        var result = await aFunction.apply(information, information)
        .call().catch(error => {
              //console.log("Error data is with information "+information+" is "+error);
              errorLog = error+" ";
            }
        );
        return errorLog;
    }
    // This read is error-safe
    async read(functionName, information){
      const toWeb3Ganache = this.ganacheHandler.Web3Contract.methods[functionName];
      var errorLog;
      var result = await toWeb3Ganache.apply(information, information)
      .call().catch(error => {
            errorLog = error+" ";
          }
      );
      if (result==undefined){
        result = "No reading"
      }
      return [result, errorLog];
    }

    async write(functionName, information) {
        var basicInfo = information.slice();
        basicInfo = {basicInfo}.basicInfo;

        const toEthersGanache = this.ganacheContract[functionName];
        const toEthersMainnet = this.mainnetContract[functionName];
        const toWeb3Ganache = this.ganacheHandler.Web3Contract.methods[functionName];
        const toWeb3Mainnet = this.mainnetHandler.Web3Contract.methods[functionName];
        var errorLog = await this.getErrorLog(basicInfo, toWeb3Ganache);
        if (errorLog!="Success"){
            return [String("No transaction hash"), String(errorLog)];
        }else{
            // First, send the information to Ganache
            var ganacheInformation = information.slice();
            ganacheInformation = {ganacheInformation}.ganacheInformation;
            ganacheInformation.push(this.ganacheHandler.ganacheOptions);
            var result = await toEthersGanache.apply(ganacheInformation, ganacheInformation);

            // Await until the Ganache transaction
            var receipt = await this.getReceipt(result.hash);

            // Second, dry-run the mainnet transaction to see if you have enough gas etc.
            var nonce = parseInt(fs.readFileSync(this.nonceLocation, 'utf8'));
            this.mainnetHandler.mainnetOptions.nonce = nonce+1;
            information.push(this.mainnetHandler.mainnetOptions);
            
            var errorLog2 = await this.getErrorLog(basicInfo, toWeb3Mainnet);
            if (errorLog!="Success"){
                return [String("No transaction hash"), String("Mainnet check failed: "+errorLog)];
            } else {
                 // Finally, send a transaction to the mainnet
                var result = await toEthersMainnet.apply(information, information);
                fs.writeFileSync(this.nonceLocation, (nonce+1).toString());
                return [String(result.hash), String("Success, everything written")];
            }
        }
    }
}

module.exports = thanksEthereumClass;