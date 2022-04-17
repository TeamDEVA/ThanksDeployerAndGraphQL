const EthereumHandler = require('./ethereumHandler');

class Reader{
    constructor() {
        this.mainnetHandler = new EthereumHandler("ganache");
        this.options = this.mainnetHandler.options;
        this.mainnetContract = this.mainnetHandler.myContract;
        //this.investigator = new Investigator();
    }

    async read(functionName, information) {
        let basicInfo = information.slice();
        basicInfo = {basicInfo}.basicInfo;
        const toEthersMainnet = this.mainnetContract[functionName];
        //const toWeb3Mainnet = this.mainnetHandler.Web3Contract.methods[functionName];
        information.push(this.mainnetHandler.mainnetOptions);
        var result;
        result = await toEthersMainnet.apply(information, information);
        
        return result;
    }
}

module.exports = Reader;