// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ThanksPay2{
    

    using SafeMath for uint256; 

    address thanksAdmin;
    event handleEmployeeEvent(string email, uint256 workerId, uint256 partnerId, uint256 monthlyWage, string workerHashData, uint256 time, uint256 mode);
    event newMonthEvent(uint256 partnerId, uint256 time, uint256 nextPayday);
    event newWithdrawalReceipt(uint256 workerId, uint256 amount, uint256 time);
    event handlePartnerEvent(uint256 partnerId, string partnerEmail, uint256 balance, string partnerLicenseId, string partnerHashData, uint256 mode, bool blocked);
    event changeInBalance(uint256, uint256 partnerId);

    struct Employee{ 
        uint256 id;
        uint256 allowedToWithdraw;
        uint256 withdrawnMonth;
        uint256 partnerId;
        uint256 monthlyTotal;
        uint256 lastWithdrawal;
        bool exists; 
    }
    
    struct Partner{
        uint256 id;
        uint256 balance;
        uint256 lastPayday;
        uint256 blockFromDay;
        bool exists;
        bool blocked;
    }

    modifier isAdmin(){
        require(msg.sender == thanksAdmin, "It's a private smart contract");
        _;
    }

    mapping(uint256 => Employee) public findEmployee;
    mapping(uint256 => Partner) public findPartner;

    
    function payDay(uint256 partnerId, uint256 lastPayday, uint256 blockFromDay, uint256 balanceAdd) public{
        require(block.timestamp - findPartner[partnerId].lastPayday > 28 days, "A month has not been passed!");
        require(msg.sender == thanksAdmin, "It's a private smart contract");
        findPartner[partnerId].lastPayday = lastPayday; // @ block.timestamp;
        findPartner[partnerId].blockFromDay = blockFromDay;
        findPartner[partnerId].balance += balanceAdd;
        emit newMonthEvent(partnerId, block.timestamp, blockFromDay);
        // @  emit newMonthEvent(partnerId, lastPayday, nextPayday);
    }

    function getWithdrawable(uint256 employeeId, uint256 timestamp) public view returns(uint256, uint256){
        Employee memory myEmployee = findEmployee[employeeId];
        require(myEmployee.exists == true, "This employee is not registered");
        //require(timestamp < myPartner.blockFromDay, "The withdrawals are closed during the audit period");
        //require(timestamp > myPartner.lastPayday, "DEV-ERROR: withdrawing BEFORE last payday");


        uint256 partnerId = findEmployee[employeeId].partnerId;
        Partner memory myPartner = findPartner[partnerId];
        
        // block the payment if the withdrawals are blocked
        if (timestamp > myPartner.blockFromDay &&
            timestamp.sub(myPartner.lastPayday) < 7 days){
            // next Payday should take into account the time for business days
            return (0, 0);
        }

        // 2 variables we will track in this function
        uint256 withdrawnMonth = 0; // how much you have withdrawn this month already
        uint256 allowedToWithdraw = 0; // how much you are still allowed to withdraw

        // Find the partner and the employee

        // The maximum you can withdraw in one month
        uint256 monthylTotal = myEmployee.monthlyTotal;
        // Get the timestamps of this and next paydays
        uint256 lastPayday = myPartner.lastPayday;

        // If the worker's last withdrawal is behind the partner's payday, reset his withdrawals this month to 0
        // Otherwise, don't reset anything.
        if (int(myEmployee.lastWithdrawal) - int(lastPayday) < 0){
            withdrawnMonth = 0;
        } else {
            withdrawnMonth = myEmployee.withdrawnMonth;
        }

        // @block.timestamp
        if (timestamp - lastPayday >= 7 days){
            // unlocks the first 15% of the salary
            allowedToWithdraw = monthylTotal.mul(30).div(100);
        }
        if (timestamp - lastPayday >= 14 days){
            // adds the next 20% of the salary
            allowedToWithdraw = allowedToWithdraw.add(monthylTotal.mul(40).div(100));
        }
        if (timestamp - lastPayday >= 21 days){
            // adds the last 15% of the salary (reached total withdrawal)
            allowedToWithdraw = allowedToWithdraw.add(monthylTotal.mul(30).div(100));
        }

        // subtract the money the user has already withdrawn this month
        allowedToWithdraw = allowedToWithdraw.sub(myEmployee.withdrawnMonth, "DEV-ERROR: Allowance is smaller than monthly withdrawals.");
        return (allowedToWithdraw, withdrawnMonth);
    }

    function withdrawMoney(uint256 employeeId, uint256 timestamp, uint256 amount) public{
        Employee memory myEmployee = findEmployee[employeeId];
        Partner memory myPartner = findPartner[myEmployee.partnerId];
        uint256 allowedToWithdraw;
        uint256 withdrawnMonth;
        (allowedToWithdraw, withdrawnMonth) = getWithdrawable(employeeId, timestamp);
        require(timestamp < myPartner.blockFromDay, "Audit period: the withdrawals are closed");
        require(timestamp > myPartner.lastPayday, "DEV-ERROR: withdrawing BEFORE last payday");
        require(myPartner.lastPayday!=0, "The partner company did not register payday yet");
        require(timestamp - myEmployee.lastWithdrawal > 1 days, "You can only withdraw once per day");
        require(amount <= myPartner.balance, "The partner company does not have enough balance");
        require(allowedToWithdraw!=0, "You cannot withdraw anything yet");
        require(allowedToWithdraw > amount, "You do not have this much to withdraw");
        require(msg.sender == thanksAdmin, "It is a private smart contract");
        
        // update lastWithdrawal, allowedToWithdraw, balance
        findEmployee[employeeId].lastWithdrawal = timestamp; //@block.timestamp;
        findEmployee[employeeId].allowedToWithdraw = allowedToWithdraw.sub(amount, "DEV-ERROR: allowance is smaller than withdrawed amount");
        findPartner[myEmployee.partnerId].balance = myPartner.balance.sub(amount, "DEV-ERROR: Partner balance is smaller than withdrawal");
        findEmployee[employeeId].withdrawnMonth = withdrawnMonth.add(amount);
        emit newWithdrawalReceipt(employeeId, amount, timestamp);
    }
    
    // mode 0 = register new partner
    // mode 1 = edit existing partner with this id
    // mode 2 = delete the partner .. we don't hve ths one
    function handlePartner(uint256 mode, uint256 partnerId, string memory partnerEmail, uint256 balance, string memory partnerLicenseId, string memory partnerHashData, bool blocked) 
    public{
        require(msg.sender == thanksAdmin, "It is a private smart contract");
        if (mode==0){
            require(findPartner[partnerId].exists==false, "This partner is already registered");
        }
        if (mode==1){
            require(findPartner[partnerId].exists==true, "This partner does not exist");
        } 
         
        Partner memory myPartner = Partner(partnerId, balance, 0, 0, true, blocked);
        findPartner[partnerId] = myPartner;        

        emit handlePartnerEvent(partnerId, partnerEmail, balance, partnerLicenseId, partnerHashData, mode, blocked);
    }

    // mode 0 = register new employee
    // mode 1 = edit existing employee with this id
    // mode 2 = delete the employee
    function handleEmployee(uint256 mode, uint256 workerId, uint256 partnerId, string memory workerEmail, string memory workerHashData, uint256 monthlyFullWage)
    public{
        if (mode==2){
            require(findPartner[partnerId].exists==true, "Such partner does not exist");
            require(findEmployee[workerId].exists==true, "Such employee does not exist");
            delete findEmployee[workerId];
            // mode 3 = delete;
            emit handleEmployeeEvent(workerEmail, workerId, partnerId, monthlyFullWage, workerHashData, block.timestamp, mode);
            return;
        }
        if (mode==0){
            require(findPartner[partnerId].exists==true, "Such partner does not exist");
            require(findEmployee[workerId].exists==false, "This employee is already registered");   
        }
        if (mode==1){
            require(findEmployee[workerId].exists==true, "This employee is not registered");   
        }
        require(msg.sender == thanksAdmin, "It is a private smart contract");
        Employee memory myEmployee = Employee({
            id: workerId,
            partnerId: partnerId,
            allowedToWithdraw: 0,
            withdrawnMonth: 0,
            monthlyTotal: monthlyFullWage.div(2), 
            lastWithdrawal: 0,
            exists: true});
        findEmployee[workerId] = myEmployee;

        emit handleEmployeeEvent(workerEmail, workerId, partnerId, monthlyFullWage, workerHashData, block.timestamp, mode);
    }

    constructor(){
        thanksAdmin = msg.sender;
    }     
}