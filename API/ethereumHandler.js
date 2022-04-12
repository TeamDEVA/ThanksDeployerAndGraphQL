const ethers = require("ethers");
require('dotenv').config({ path: '../.env' });
const abi = require('../data/abi/ThanksPay2.json');
const Web3 = require('web3');
const fs = require('fs');

var options = {
    "ganache": {
        "rpc": process.env.ganacheRPC,
        "private_key": process.env.GANACHE_PRIVATE_KEY,
        "addr": process.env.THANKS_ADDRESS_GANACHE
    }, 
    "mainnet": {
        "rpc": process.env.mainnetRPC,
        "private_key": process.env.MAINNET_PRIVATE_KEY,
        "addr": process.env.THANKS_ADDRESS_MAINNET
    }, 
    "testnet": {
        "rpc": process.env.polygonRPC,
        "private_key": process.env.POLYGON_PRIVATE_KEY,
        "addr": process.env.THANKS_ADDRESS_POLYGON
    }
}
class EthereumHandler {
    EthersProvider = null;
    myContract = null;
    option = {};
    web3 = null;
    constructor(network) {


        this.RPC = options[network]["rpc"];
        this.pKey = options[network]["private_key"];
        this.addr = options[network]["addr"];
        // //ganache
        // this.RPC = process.env.ganacheRPC;
        // this.pKey = process.env.GANACHE_PRIVATE_KEY;
        // this.addr = process.env.THANKS_ADDRESS_GANACHE;

        const provider = new ethers.providers.JsonRpcProvider(this.RPC);
        this.EthersProvider = provider;
        var privateKey = this.pKey;
        var signer = new ethers.Wallet(privateKey, provider);
        this.signer = signer;
        //signer.getTransactionCount().then(result => console.log(result));
        var address = this.addr;
        console.log(address);
        this.myContract = new ethers.Contract(address, abi, signer)    // Write only
        var FeeData;
        provider.getFeeData().then(feeData =>{
            FeeData = feeData;
        })
        this.ganacheOptions = {
            //chainId: 1337,
            gasPrice:  100000000000, // in WEI
            gasLimit: 390772 // in units of gas
        };

        this.mainnetOptions = {
            type: 2,
            value: "0",
            gasLimit: 390772,
            maxPriorityFeePerGas: (30*10**9), // 10 GWEI
            maxFeePerGas: 80*10**9, // 80 GWEI, should be higher than maxPriorityFeePerGas
        };  

        this.web3 = new Web3(new Web3.providers.HttpProvider(this.RPC));
        this.Web3Contract = new this.web3.eth.Contract(abi, this.addr);
    }
    async initializeNonceMainnet(network){
        console.log("Trying tow init");
        if (network=="mainnet" || network=='testnet'){
            var nonce = await this.web3.eth.getTransactionCount(process.env.polygonSenderAddress)-1;
            fs.writeFileSync('./API/test.txt', (nonce).toString());
        }
    }
    async getRevertReason(txHash) {
        var revertString;

        console.log(txHash);
        const web3 = new Web3(new Web3.providers.HttpProvider(this.RPC));
        const tx = await web3.eth.getTransaction(txHash)
        try {
            var result = await web3.eth.call(tx, tx.blockNumber)
            result = result.startsWith('0x') ? result : `0x${result}`

            revertString = "No errors";
        }
        catch (error) {
            const result = error.data;
            const reason = web3.utils.toAscii(result);
            revertString = reason;
        }
        return revertString;

    }
    async sayHi() {
        console.log({
            "ethereumHandler say" : "hi"
        })
    }
}

module.exports = EthereumHandler;