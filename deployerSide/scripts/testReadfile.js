require('dotenv').config({ path: '.env' });
var path = require('path');
const Web3 = require('web3');
const fs = require('fs')

async function main() {
    let content = fs.readFileSync(path.join(__dirname, '/../API/nonce.txt'));
    console.log(content.toString());
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });