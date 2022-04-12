const EthereumHandler = require('./ethereumHandler');

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
    async greet(...information) {
        return await this.read(information, this.myContract.greet)
    }     
}

async function run() {
    let reader = await new Reader();
    console.log({
        "result": await reader.greet()
    });
}

run();

module.exports = Reader;