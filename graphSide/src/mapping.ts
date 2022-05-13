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
import {AllEmployee, AllLog, Log, Time, Employee, Partner, Month, Withdrawal, Block, AllPartner } from "../generated/schema"

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

export function handleHandleEmployeeEvent(event: handleEmployeeEvent): void {
  let employee: Employee;
  
  if (event.params.mode==BigInt.fromI32(0)){
    employee = new Employee(event.params.workerId.toString()) as Employee;
    employee.status = true;
  }else{
    employee = Employee.load(event.params.workerId.toString()) as Employee;
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
      employee.currentBalance = BigInt.fromI32(0);
      employee.hashData = event.params.workerHashData;
      let time = new Time(event.transaction.hash.toHex());
      time.timestamp = event.params.time;
      let tmp1:BigInt = event.params.time;
      let date:Date = new Date(tmp1.toI32()*1000);
      time.UTC = date.toString();
      employee.registeredSince = time.id;
      time.save();
      employee.totalAllowance = event.params.monthlyWage.div(BigInt.fromI32(2));
      employee.monthlyWage = event.params.monthlyWage;
      employee.allowedToWithdraw = BigInt.fromI32(0);
      employee.registrationHash = event.transaction.hash.toHex();
      // Entity fields can be set based on event parameters
      
      let partner = Partner.load(event.params.partnerId.toString());
      if (partner){
        employee.partner = partner.id;
        partner.save();
    }
  }
  employee.save();
}

export function handleNewMonthEvent(event: newMonthEvent): void {
  let month = new Month(event.params.partnerId.toHex() + event.params.lastPayday.toHex());
  let partner = Partner.load(event.params.partnerId.toString()); 
  if (partner){
    month.partner = partner.id;
    partner.currentMonth = month.id;
    partner.save();
  }
  let startTime = new Time(event.transaction.hash.toHex());
  startTime.timestamp = event.params.lastPayday;
  let tmp1:BigInt = event.params.lastPayday;
  let tmp2:BigInt = tmp1.times(BigInt.fromI32(1));
  let date:Date = new Date(tmp2.toI64());
  startTime.UTC = date.toString();
  month.startFrom = startTime.id;
  startTime.save();

  let blockFrom = new Time(event.transaction.hash.toHex());
  blockFrom.timestamp = event.params.blockFromDay;
  let tmp3:BigInt = event.params.blockFromDay;
  let tmp4:BigInt = tmp3.times(BigInt.fromI32(1));
  let date2:Date = new Date(tmp4.toI64());
  blockFrom.UTC = date2.toString();
  month.blockFrom = blockFrom.id;
  blockFrom.save();

  month.registrationHash = event.transaction.hash.toHex();
  month.save();
}

export function handleHandlePartnerEvent(event: handlePartnerEvent): void {
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
    partner = new Partner(event.params.partnerId.toString()) as Partner;
    partner.status = true;
  }
  else
  { 
    partner = Partner.load(event.params.partnerId.toString()) as Partner;
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
      partner.blocked = event.params.blocked;
      partner.save();
    }
}
    

export function handleNewWithdrawalReceipt(event: newWithdrawalReceipt): void {
  let withdrawal = new Withdrawal(event.transaction.hash.toHex());
  let employee = Employee.load(event.params.workerId.toString()) as Employee;
  let partner: Partner;
  if (employee){
    withdrawal.employee = employee.id;
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
  let time = new Time(event.transaction.hash.toHex());
  time.timestamp = event.params.time;
  let tmp1:BigInt = event.params.time;
  let tmp2:BigInt = tmp1.times(BigInt.fromI32(1));
  let date2:Date = new Date(tmp2.toI64());
  time.UTC = date2.toString();
  withdrawal.time = time.id;
  time.save();
  
  withdrawal.amount = event.params.amount;
  withdrawal.save();
}


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

}