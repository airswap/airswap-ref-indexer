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
########### server configuration ###########
EXPRESS_PORT=4001
NODE_URL="http://localhost:3000/"
DATABASE_TYPE="ACEBASE"
DATABASE_PATH="/var/lib/airswap"
MAX_RESULTS_FOR_QUERY=100
########### smartcontract definition ###########
NETWORK=1
API_KEY="<add your api key>"
</pre>

> $ yarn start

# Commands
## Benchmarking node or create fake data:
> $ yarn bench
## Get a valid expiry timestamp for postman collection 
> $ yarn date

