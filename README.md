# tendies.exchange monorepo

# Folder structure

    /firebase_indexer
    /indexer
    /tendies-exchange-ui

`tendies-exchange-ui` contains the next.js (React) app for the Tendies Exchange frontend.
`indexer` contains the scripts that calculate aggregate the Compound borrow rate per block, then calculate the CAR token's Expiring Multiparty price identifier
`firebase_indexer` polls the blockchain to index the data which the frontend queries. By indexing this data, we save on infura calls. It's common for other projects to use Graph Protocol Indexers.
