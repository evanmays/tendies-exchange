# Price Identifier Indexer

This folder contains code for calculating the UMA price identifier for CAR tokens.

While CAR tokens are trading, the price identifier is self-referential. So, the a target for the price identifier is the current price of a CAR token on Uniswap.

On the expiration date, the price identifier switches to the 28 day average borrowing rate.

## How to use the code
At synth expiration, the CAR token is worth the 28 day average borrowing rate. This is done by looking at all the blocks over the past 28 days, calling the cToken's `borrowRatePerBlock()`, then using the geometric mean formula.

`indexer.py` indexes the borrow rate per block in a sqlite3 database file.

`python3 indexer.py --provider-url http://localhost:8545`

If you'd like to increase the indexing window do something like this

`python3 indexer.py --provider-url http://localhost:8545 --window-size 400000`

If you are using infura (worried about doing a lot of requests in short period of time), leave window size as default and run this script during the entire month to get a months worth of data. As in, if you want data for all of April, start running the script April 1st, then stop April 30th.

`priceFeed.py` takes that json file and calculates the average from the start block to the end block. You wan't the end block to be the CAR token expiration block, and the start block to be 28 days before the end block.

`python3 priceFeed.py <borrow rates dataset> --start-block <block number> --end-block <block number>`


## How to get resolution price

1. Get the borrow rate dataset. Either run `indexer.py` or download it from `https://cache.tendies.exchange/borrow_rate_per_block.json`
2. Get the block the CAR token expired in. Let's say it is block number 1,000,000
3. Get the block 28 days before the CAR token expired. Let's say it is block number 800,000
4. `python3 priceFeed.py borrow_rate_per_block.json --start-block 800000 --end-block 1000000`
