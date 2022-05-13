import sys
import os
import ruamel.yaml
import re
from ruamel.yaml import YAML
import json


env_vars = {} # or dict {}
env_file = '../deployerSide/.env'
with open(env_file) as f:
    for line in f:
        if line.startswith('#') or not line.strip():
            continue
        key, value = line.strip().split('=', 1)
        env_vars[key.strip()] = value.strip() # Save to a list



# read the JSON
with open('./abis/ThanksPay2.json', 'r') as f:
  data = json.load(f)

events = {}

def list_to_string(my_list):
    my_string =''
    for x in my_list:
        my_string += x +','
    my_string = my_string.rstrip(',')
    
    return my_string

for x in data:
    if x['type']=='event':
        events[x['name']] = list_to_string([input['type'] for input in x['inputs']])

print(events)

# update the yaml file
yaml=YAML()

file_name = './subgraph.yaml'
config, ind, bsi = ruamel.yaml.util.load_yaml_guess_indent(open(file_name))
config['dataSources'][0]['source']['address'] = env_vars['THANKS_ADDRESS_POLYGON']
config['dataSources'][0]['mapping']['entities'] = []
config['dataSources'][0]['mapping']['eventHandlers'] = []


for eventName in events.keys():
    config['dataSources'][0]['mapping']['entities'].append(str(eventName))
    config['dataSources'][0]['mapping']['eventHandlers'].append({'event': eventName+'('+events[eventName]+')', 'handler': 'handle'+re.sub('([a-zA-Z])', lambda x: x.groups()[0].upper(), eventName, 1)})

with open(file_name, 'w') as fp:
    yaml.dump(config, fp)