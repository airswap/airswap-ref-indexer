# airswap-indexer-node
The purpose of a node is to hold a database containing the latest OTC order available for users.
Each time an entry is added to a node, the entry is broadcasted to others nodes.

This repository holds a registry server (for development) and a node server.
When a node starts up, it gets all nodes ip from the registry.

Development with http server:

When ^C is fired, the node send a delete to the registry and others peers to notify that the node won't be responding.

# Prerequisite
- NodeJs 14.X
- yarn
- Infura API key : https://infura.io/

# How to start ?
> $ cp .env.example .env
- Edit the file with the correct values.
- Add Infura api key
> $ yarn && yarn compile

Then :
## Prod
The .env should be like this : 
>########### server configuration
EXPRESS_PORT=3000
NODE_URL="http://localhost:3000/"
DELETE_DB_ON_START=1
DATABASE_TYPE="ACEBASE"
########### smartcontract definition
USE_SMART_CONTRACT=1
REGISTRY="0xC32a3c867aBAd28d977e1724f92D9684fF3d2976"
NETWORK="goerli"
API_KEY="<add your api key>"

> $ yarn start

## Debug
If you want to start mutliple nodes on the same machine, you need to start the http registry.
The .env should be like this : 

> ########### server configuration
EXPRESS_PORT=4001
LOCAL_ONLY=1
DELETE_DB_ON_START=1 #1/0
LOCAL_INTERFACES="Ethernet,ens160"
DATABASE_TYPE="ACEBASE" #IN_MEMORY,ACEBASE 
########### smartcontract definition
USE_SMART_CONTRACT=0
REGISTRY="http://localhost:4000"  

Find ethernet card names: ifconfig/ipconfig/ip address and paste it in LOCAL_INTERFACES

In a first terminal
> $ yarn registry

Then in anoter one:
> $ yarn start

# Commands
## Benchmarking node or create fake data:
> $ yarn bench
## Get a valid expiry timestamp for postman collection 
> $ yarn date

