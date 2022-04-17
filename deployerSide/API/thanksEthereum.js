const EthereumHandler = require('./ethereumHandler');
const {updateNonceConditionally, getNonce} = require('./nonceManager');
const fs = require('fs')
const Investigator = require('./investigator');
require('dotenv').config({ path: '../.env' });


class thanksEthereumClass {
    constructor(nonceLocation) {
        this.nonceLocation = nonceLocation;
        this.mainnetHandler = new EthereumHandler("mainnet");
        this.ganacheHandler = new EthereumHandler("ganache");
        this.options = this.mainnetHandler.options;
        this.mainnetContract = this.mainnetHandler.myContract;
        this.ganacheContract = this.ganacheHandler.myContract;
        this.investigator = new Investigator();
    }
    async initialize(){
      await this.mainnetHandler.initializeNonceMainnet("mainnet");
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