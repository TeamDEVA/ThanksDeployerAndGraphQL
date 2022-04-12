const Web3 = require("web3");
const web3 = new Web3("https://rpc-mumbai.maticvigil.com/");

const address = "0x43a35f6D0AEA7bdcD07E12aA4769353241ef1433";
const abi = [{"type":"function","name":"greet","stateMutability":"view","inputs":[],"outputs":[{"type":"string","name":""}]}];

async function greet(){
	const Contract = new web3.eth.Contract(abi,address);
	const result = await Contract.methods.greet()

	console.log("result:", result);
}

greet();