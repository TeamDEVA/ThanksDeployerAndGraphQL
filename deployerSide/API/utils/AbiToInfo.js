const fs = require('fs');
const isDEBUG = false;

class AbiToInfo {
    constructor() {
        this.thanksPay2AbiDir = __dirname + "/../../../graphSide/abis/ThanksPay2.json";
        this.thanksPay2Abi = fs.readFileSync(this.thanksPay2AbiDir);
        this.info = JSON.parse(this.thanksPay2Abi);
    }
    // provide json abi, and it returns json object that has field "name" = name
    getObj(abi, name) {
        // get through array of objects
        for(let i = 0; i < abi.length; ++i)
        {
            // check out every key, values
            let obj = abi[i];
            for(const key in obj) {
                if(key === 'name' && obj[key] === name) {
                    return obj;
                }
            }
        }
    }
}

// for debugging purpose
async function main()
{
    console.log("DEBUG:");
    let abiToInfo = new AbiToInfo();
    let obj = abiToInfo.getObj(abiToInfo.info, 'handlePartner');
    obj['found'] = true;
    console.log(obj);
}
if(isDEBUG)
main()
    .then(()=>process.exit(0))
    .catch((error) => {console.log(error); process.exit(1);})

module.exports = AbiToInfo;