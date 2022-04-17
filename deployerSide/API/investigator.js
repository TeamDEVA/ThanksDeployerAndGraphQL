const EthereumHandler = require('./ethereumHandler');

class Investigator{
    constructor() {
        const ethereumHandler = new EthereumHandler("mainnet");
        this.web3 = ethereumHandler.web3;
    }

    async getReceipt(txHash){
        const sleep = (milliseconds) => {
            return new Promise(resolve => setTimeout(resolve, milliseconds))
        }
        
        const web3 = this.web3;
        web3.eth.handleRevert = true;
        var expectedBlockTime = 1*10**3;
        var transactionReceipt;
        while (transactionReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
            transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
            await sleep(expectedBlockTime);
        }
        //console.log("Got the transaction receipt: ", transactionReceipt)
        return (transactionReceipt);
    }

    async getRevertReason(txHash){
        const web3 = this.web3;
        const tx = await web3.eth.getTransaction(txHash);
        var result = await web3.eth.call(tx, tx.blockNumber);
        result = result.startsWith('0x') ? result : `0x${result}`
        if (result && result.substr(138)) {
      
          const reason = web3.utils.toAscii(result.substr(138))
          console.log('Revert reason:', reason)
          return reason
        } else {
          console.log('Cannot get reason - No return value')
        }
}
}
const inv = new Investigator();
// inv.getReceipt("0xf4e692e609e7fc37e34608229b862713c4c862504f4a1f910efb26fb9bb7ba7e").then(result =>
// console.log(result));
module.exports = Investigator;