#!/usr/bin/python

import sys

addr = "0x8d43Ef6738647094B2b29fc5c787d2aC9Ef9913a"

if(len(sys.argv) > 1):
    addr = str(sys.argv[1])

program = \
'''
specVersion: 0.0.2
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum/contract
    name: ThanksPay2
    network: mumbai
    source:
      address: "{}"
      abi: ThanksPay2
      startBlock: 25634096
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.5
      language: wasm/assemblyscript
      entities:
        - newEmployeeEvent
        - newMonthEvent
        - newPartnerEvent
        - newWithdrawalReceipt
      abis:
        - name: ThanksPay2
          file: ./abis/ThanksPay2.json
      eventHandlers:
        - event: newEmployeeEvent(string,uint256,uint256,uint256,string,uint256)
          handler: handlenewEmployeeEvent
        - event: newMonthEvent(uint256,uint256,uint256)
          handler: handlenewMonthEvent
        - event: newPartnerEvent(uint256,string,uint256,string,string)
          handler: handlenewPartnerEvent
        - event: newWithdrawalReceipt(uint256,uint256,uint256)
          handler: handlenewWithdrawalReceipt
      # blockHandlers:
      #   - function: handleBlock

      file: ./src/mapping.ts
'''.format(addr)
f = open("subgraph.yaml", "w")
f.write(program)
f.close()
