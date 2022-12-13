# airswap-indexer-node
The purpose of a node is to hold a database containing the latest OTC order available for users.
Each time an entry is added to a node, the entry is broadcasted to others nodes.

When a node starts up, it gets all nodes ip from the registry contract.

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

<pre>
########### server configuration
EXPRESS_PORT=3000
NODE_URL="http://localhost:3000/"
DELETE_DB_ON_START=1
DATABASE_TYPE="IN_MEMORY"
########### smartcontract definition
REGISTRY="0xC32a3c867aBAd28d977e1724f92D9684fF3d2976"
NETWORK="goerli"
API_KEY="<add your api key>"
</pre>

> $ yarn start

# Commands
## Benchmarking node or create fake data:
> $ yarn bench
## Get a valid expiry timestamp for postman collection 
> $ yarn date

