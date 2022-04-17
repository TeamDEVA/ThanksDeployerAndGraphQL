const fs = require('fs')

function getNonce(){
    var currentNonce;
    //console.log("LOL");
    var dat = fs.readFileSync('./API/test.txt', 'utf8');
    console.log(dat);
    return parseInt(dat)+1;
}

function updateNonce(nonce){
    try {
        fs.writeFileSync('./API/test.txt', (nonce).toString())
      } catch (err) {
        console.error(err)
      }
}

async function updateNonceConditionally(txHash, nonce, web3){
    var revertString = await getRevertReason(txHash, web3);
    updateNonce(nonce);

}
async function getRevertReason(txHash, web3) {
    var revertString;
    console.log(txHash);
    // const web3 = new Web3(new Web3.providers.HttpProvider(process.env.polygonRPC));
    const tx = await web3.eth.getTransaction(txHash);
    console.log(tx);
    var result = await web3.eth.call(tx, tx.blockNumber)
        console.log(result);
    try {
        var result = await web3.eth.call(tx, tx.blockNumber)
        console.log(result);
        result = result.startsWith('0x') ? result : `0x${result}`
        revertString = "Success";
    }
    catch (error) {
        const result = error.data;
        const reason = web3.utils.toAscii(result);
        revertString = "Execution reverted: "+reason;
    }
    return revertString;
}

module.exports = {updateNonceConditionally, getNonce};