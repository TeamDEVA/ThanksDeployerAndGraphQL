require('dotenv').config({ path: '.env' });
const Web3 = require('web3');

async function main() {
    let RPC = process.env.mumbaiRPC;
    let web3 = new Web3(new Web3.providers.HttpProvider(RPC));
    let blockNumber = await web3.eth.getBlockNumber();
    console.log({
        "latest block number is " : blockNumber,
    });
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });