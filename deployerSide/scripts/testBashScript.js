const execSync = require('child_process').execSync;
async function main()
{
    console.log({
        "shell is": process.env.ComSpec
    })
    const output = execSync('npx hardhat compile --force', { encoding: 'utf-8' });  // the default is 'buffer'
    console.log('Output was:\n', output);
}
main()
    .then(()=>process.exit(0))
    .catch((error) => {console.log(error); process.exit(1);})