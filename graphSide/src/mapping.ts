import { BigInt } from "@graphprotocol/graph-ts"
import { ethereum } from '@graphprotocol/graph-ts'
//import divide from 'divide-bigint'
import {
  ThanksPay2,
  handleEmployeeEvent,
  newMonthEvent,
  handlePartnerEvent,
  newWithdrawalReceipt
} from "../generated/ThanksPay2/ThanksPay2"
import {AllEmployee, AllLog, Log, Employee, Partner, Month, Withdrawal, Block, AllPartner } from "../generated/schema"

function getAllEmployee(): AllEmployee
{
  let allEmployee = AllEmployee.load("suka");
  if(allEmployee == null) 
  {
    allEmployee = new AllEmployee("suka");
    allEmployee.employees = [];
    allEmployee.save();
  }
  return allEmployee;
}

// export function handleDeleteEmployeeEvent(event: deleteEmployeeEvent): void {
//   let employee = Employee.load(event.params.workerId.toHex());
//   if(employee)
//   {
//     employee.status = false;
//     employee.save();
//   } else 
//   {
//     saveNewLog("can't find the employee id " + event.params.workerId.toString());
//   }
// }

export function handlenewEmployeeEvent(event: handleEmployeeEvent): void {
  let employee: Employee;
  
  if (event.params.mode==BigInt.fromI32(0)){
    employee = new Employee(event.params.workerId.toHex()) as Employee;
    employee.status = true;
  }else{
    employee = Employee.load(event.params.workerId.toHex()) as Employee;
    if (employee){
      if (event.params.mode==BigInt.fromI32(1)){
        employee.status = true;
      }
      if (event.params.mode==BigInt.fromI32(2)){
        employee.status = false;
      }
    }
  }

    if (employee){
      employee.email = event.params.email;
      employee.hashData = event.params.workerHashData;
      employee.registeredSince = event.params.time;
      employee.totalAllowance = event.params.monthlyWage.div(BigInt.fromI32(2));
      employee.monthlyWage = event.params.monthlyWage;
      employee.allowedToWithdraw = BigInt.fromI32(0);
      employee.registrationHash = event.transaction.hash.toHex();
      // Entity fields can be set based on event parameters
      
      let partner = Partner.load(event.params.partnerId.toHex());
      if (partner){
        employee.partner = partner.id;
        partner.save();
    }
  }
  employee.save();

}

export function handlenewMonthEvent(event: newMonthEvent): void {
  let date:  Date = new Date(event.params.time.toI32());
  let monthInt = date.getUTCMonth();
  let yearInt = date.getUTCFullYear();
  let monthYearId = monthInt.toString() + "/" + yearInt.toString();
  let month = new Month(monthYearId);
  let partner = Partner.load(event.params.partnerId.toHex()); 
  if (partner){
    month.partner = partner.id;
    partner.currentMonth = month.id;
  }
  month.startTime = event.params.time;
  month.blockFrom = event.params.time;
  month.registrationHash = event.transaction.hash.toHex();
  month.save();
}

export function handlenewPartnerEvent(event: handlePartnerEvent): void {
  // let allPartner = AllPartner.load("sukaBlyat");
  // if(allPartner == null) 
  // {
  //   allPartner = new AllPartner("sukaBlyat");
  //   allPartner.save();
  // }
  let partner: Partner;
  // mode 0 = register new partner
  if (event.params.mode==BigInt.fromI32(0))
  {
    partner = new Partner(event.params.partnerId.toHex()) as Partner;
    partner.status = true;
  }
  else
  { 
    partner = Partner.load(event.params.partnerId.toHex()) as Partner;
    if (partner){
      if (event.params.mode==BigInt.fromI32(1)){
        partner.status = true;
      }
      if (event.params.mode==BigInt.fromI32(2)){
        partner.status = false;
      }
    }
  }
  if (partner){
      partner.balance = (event.params.balance);
      partner.email = event.params.partnerEmail; 
      partner.hashData = event.params.partnerHashData;
      partner.registrationHash = event.transaction.hash.toHex();
      partner.status = true;
      
      //console.log(event.params.partnerId.toHex());
      partner.save();
    }
}
    

export function handlenewWithdrawalReceipt(event: newWithdrawalReceipt): void {
  let withdrawal = new Withdrawal(event.transaction.hash.toHex());
  let employee = Employee.load(event.params.workerId.toHex()) as Employee;
  let partner: Partner;
  if (employee){
    withdrawal.byEmployee = employee.id;
    let partnerId = employee.partner;
    if (partnerId){
      partner = Partner.load(partnerId) as Partner;
    }
    if (partner){
      withdrawal.month = partner.currentMonth;
      partner.save();
    }
    employee.save();
  }

  withdrawal.time = event.params.time;
  withdrawal.amount = event.params.amount;
  withdrawal.save();
}

// this function returns all the logs
function getAllLog(): AllLog
{
  let allLog = AllLog.load("suka");
  if(allLog == null) 
  {
    allLog = new AllLog("suka");
    let logs = allLog.logs;
    allLog.nextId = 0;
    // make a starting log
    let log = new Log(allLog.nextId.toString());    
    log.log = "start logging";
    log.save();
    // push the new starting log to allLog
    logs.push(log.id);
    allLog.logs = logs;
    allLog.nextId = allLog.nextId + 1;
    allLog.save();
  }
  return allLog;
}

function saveNewLog(str:string):void {
  let allLog = getAllLog();
  // make a starting log
  let log = new Log(allLog.nextId.toString());    
  log.log = "at " + str;
  log.save();
  // push the new starting log to allLog
  //let logs = allLog.logs;
  let newLogs:string[] = []; // make an empty log field
  newLogs.push(log.id);
  let i = allLog.nextId - 1;
  let cnt = 0;
  while(i >= 0 && cnt < 9) // load the 8 latest log
  {
    log = Log.load(i.toString()) as Log;
    newLogs.push(log.id);
    cnt ++;
    i --;
  }
  allLog.logs = newLogs;
  allLog.nextId = allLog.nextId + 1;
  allLog.save();
}

export function handleBlock(block: ethereum.Block): void {
  // let id = block.hash.toHex();
  // let timeStamp = block.timestamp; // BigInt
  // let contractAddr = block.author;
  // let allEmployee = getAllEmployee();
  // if(allEmployee)
  // {
  //   let allEmployeeArr = allEmployee.employees;
  //   for(let i = 0; i < allEmployeeArr.length; ++i)
  //   {
  //     let employeeId = allEmployeeArr[i];
  //     let employee = Employee.load(employeeId);
  //     if(employee)
  //     {
  //       let partnerId = employee.partner;
  //       if(partnerId)
  //       {
  //         let partner = Partner.load(partnerId);
  //         if(partner)
  //         {
  //           let lastPayday = partner.lastPayday;
  //           if(lastPayday)
  //           {
  //             let timeDiff = timeStamp.minus(lastPayday);
  //             let secondPerDay:BigInt = BigInt.fromI32(60*60*24);
  //             employee.time = timeDiff.div(secondPerDay);
  //             let threshold1 = BigInt.fromI32(7);
  //             if(timeDiff.div(secondPerDay) > threshold1)
  //             {
  //               //employee.allowedToWithdraw = employee.
  //             }
  //             saveNewLog("cal btw blk timestamp: " + timeStamp.toString() + " & lastPayday: " + (lastPayday.toString()));
  //           } else 
  //             saveNewLog("can't get lastPayday of partner " + (partnerId as string));
  //         } else 
  //         {
  //           employee.time = timeStamp;
  //         }
  //         employee.save();
  //       }
  //     } else 
  //     {
  //       saveNewLog("not detect employee mf from " + employeeId.toString());   
  //     }
  //   }
  // } else { 
  //   saveNewLog("not detect allEmployee mother fucker");   
  // }
}