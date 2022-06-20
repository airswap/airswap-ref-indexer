# airswap-indexer-node
The purpose of a node is to hold a database containing the latest OTC order available for users.
Each time an entry is added to a node, the entry is broadcasted to others nodes.

This repository holds a registry server and a node server.
When a node starts up, it gets all nodes ip from the registry, then send its own.
When ^C is fired, the node send a delete to the registry and others peers to notify that the node won't be responding.
For now the registry is http only, it will be in smart contract in a near future.
# Prerequisite
- NodeJs 14.X
- yarn

# Commands
Compile
> $ yarn compile

Start the regsitry
> $ yarn registry

Start the node
> $ yarn start

# How to start ?
> $ cp .env.example .env

Edit the file with the correct values. If you are running the registry on the same machine <ip> should be replaced by localhost.

Then
> $ yarn && yarn compile

> $ yarn registry

Finally in antoher terminal
> $ yarn start

# Benchmarking node or create fake data:
> $ node benchmarking/bench.js