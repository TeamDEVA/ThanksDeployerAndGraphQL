# Overview

All functions to interact with the smart contact are located in API/thanksEthereum.js

## Writing: Initializing the writer

In order to start writing, first intialize the writer:
``` 
var thanksEthereum = new thanksEthereumClass('../API/nonce.txt');
await thanksEthereum.initialize();
```
Note: pass the relative location of the nonce.txt file (relative to the folder you're calling it in). Otherwise, it will not work. 
Note 2: without the second line, writing will occur incorrectly, so don't forget it.

# Writing 

## Writing: using write functions

Pass the name of the smart contract function as the first parameter, and the array of arguments for the smart contract as the second parameter. 
```
    var result = await thanksEthereum.write("handlePartner", [
      mode, // mode
      id, // 
      id + "@gmail.com", // email
      10000, //balance
      "0x1231284584958234958239459324859", // partner License Id
      "0x1234567890"]
    );
```

**var result** will have two fields: the first field is a transaction hash, and the second one is a possible errorLog. Example values:
- `['0x159b47d1a0891566820c933dd02bc537f68248d9314be975dea6a5c4670fc90b',
'Success, everything written']` - no errors
 - `['No transaction hash',
'Error: Your request got reverted with the following reason string: Audit period: the withdrawals are closed ']` - the user tried to withdraw money when the card was blocked
- `['No transaction hash',
'Error: Your request got reverted with the following reason string: You cannot withdraw anything yet ']` - the user tried to withdraw money in the first week.

## Writing: overview of the smart contract functions.

Creating, editing, and deleting the partners and workers are handled by the same functions, by setting different modes.
mode = 0: create a new partner/worker
mode = 1: edit a new partner/worker
mode = 2: delete a partner/worker (in this case, all other parameters can be simply 0)

You pass these, along with other parameters, like this:

`handlePartner: (int mode, int partnerId, string partnerEmail, int balance, string partnerLicenseId, string partnerHashData)`
- **balance** is the monthly balance that the partner is willing to give to thanksPay to benefit employees.
`handleEmployee: (int mode, int workerId, int partnerId, string workerEmail, string workerHashData, int monthlyFullWage)`
- **monthlyFullWage** should be a full monthly wage of the worker (it will be automatically cut in half for withdrawable balance).

The other functions:

Note: all payments must be denominated in won (i.e. 3000000 won)

Register a new payday

`payDay: (int partnerId, int lastPayday, int blockFromDay, int balanceAdd)`
- **partnerId**: id of the partner who registers the payday
- **lastPayday**: UNIX timestamp (in seconds, NOT milliseconds!) that will start the payment. Call this function only once per month, on the day of the payment.
- **blockFromDay**: UNIX timestamp of audit time (typically 2 days before the next payment) after which the withdrawals will stop working
- **balanceAdd**: how much to add to partner's monthly balance

Withdraw money for the worker

`withdrawMoney**(int employeeId, int timestamp, int amount)`
- **employeeId**: the id of the worker for which you want to withdraw the money
- **timestamp**: UNIX timestamp (in seconds) at which you want to withdraw the money
- **amount**: how much you want to withdraw.

## Writing: Example uses

Note: if possible, initialize thanksEthereum only once. Otherwise, it can have bad effect on the nonce management.
```
var thanksEthereum = new thanksEthereumClass('../API/nonce.txt');
await thanksEthereum.initialize();

var result1 = await thanksEthereum.write("handlePartner", [
      mode, //mode
      partnerId,
      partnerId + "@gmail.com", // email
      10000, //balance
      "0x1231284584958234958239459324859", // partner License Id
      "0x1234567890"]
    );

var result2 = await thanksEthereum.write("payDay", [
      partnerId,
      firstPayday,
      blockFrom,
      10000]
);

var result3 = await thanksEthereum.write("handleEmployee", [
      mode,
      workerId,
      partnerId,
      partnerId+"@gmail.com",
      "0x5e714A21331A2bC941abF45F8Ba974B1B226eBd3",
      350]);
      
var result4 = await thanksEthereum.write("withdrawMoney", [
        id,
        thisDate,
        40]);
```
# Reading

Due to technical limitations of Ethereum, we have two classes of read functions:

## Reading: reading the available balance

**getWithdrawable**: (int workerId, int timestamp)
Will get the available balance for withdrawal (first parameter), and the total amount of monthly withdrawals a user has already made (second parameter).

```
var result = await thanksEthereum.read("getWithdrawable", [
workerIdd,
thisDate]);
console.log(result);
```
**result** will have two fields: 

result[0] is a json with the following format:
```
{
    '0': int // available balance for withdrawals,
    '1': int // total withdrawals this month
}
```

result[1] is a possible error log.

Example results:
- `[ Result { '0': '0', '1': '0' }, undefined ]` - everything is okay
- `['No reading', 'Error: Returned error: VM Exception while processing transaction: revert DEV-ERROR: Allowance is smaller than monthly withdrawals. '
]` - something went wrong, probably you sent an earlier timestamp than the one sent before (subsequent timestamps obviously must be larger than previous ones).


## Reading: everything else

We are now updating GraphQL query so that it works for sure. Please wait some time...
