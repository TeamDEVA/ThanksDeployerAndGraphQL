const EthereumHandler = require('../API/ethereumHandler');

class Reader{
    constructor(){
        const ethereumHandler = new EthereumHandler();
        this.myContract = ethereumHandler.myContract;
        this.options = ethereumHandler.options;
    }
    async read(information, readFunction) {
        information.push(this.options);
        var result = await readFunction.apply(information, information);
        return result;
    }
    async getWorker(...information) {
        return await this.read(information, this.myContract.getWorker)
    }
    
    async getAllWorker() {
        return await this.myContract.getAllWorker();
    }

    // (string memory partnerLicenseId
    async getPartner(...information) {// 3 
        information.push(this.options);
        return await this.read(information, this.myContract.getPartner);
    }
    // 
    async getAllPartner(...information) {
        return await this.myContract.getAllPartner();
    }
    


}

module.exports = Reader;