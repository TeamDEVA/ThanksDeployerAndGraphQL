const fs = require('fs');
const readline = require('readline');

//https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

class changeEnvAddress {
    constructor(){
    }
    async change(names, addrs)
    {
        if(names.length != addrs.length)
        {
            console.log("names and adrress arrays aren't equal in length");
            return;
        }
        let finalString = "";
        const fileStream = fs.createReadStream('./.env');
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        // Note: we use the crlfDelay option to recognize all instances of CR LF
        // ('\r\n') in input.txt as a single line break.
        for await (const line of rl) {
            // Each line in .env will be successively available here as `line`.
            //console.log(`Line from file: ${line}`);
            let str = line;
            for(let i = 0; i < names.length; ++i)
            {
                let name = names[i];
                let newAddr = addrs[i];
                let index = str.search(name);
                if(index > -1)
                {
                    let addr = str.replace(name + " = ", "");
                    str = str.replace(addr, newAddr);
                    console.log("+ change: ", str);
                    break;
                } 
            }
            finalString += str + '\n';
        }
        await fs.writeFileSync("./.env", finalString);
    }
}

module.exports = changeEnvAddress;