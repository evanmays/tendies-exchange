import json
import sys
from sqlDatabase import SqlDatabase
import math
import argparse

# startBlock index and endBlock index are inclusive
# order is not guaranteed
def getBorrowRatePerBlock(dataset_filename, start_block, end_block):
  """
  Multiple options to implement this function. Please see Markets & Data sources. In this example, we will process the results from the indexing script. https://github.com/evanmays/tendies-exchange/tree/master/indexer
  1. Process raw Ethereum full node event logs to reconstruct the borrow rate per block from the Compound USDC utilization rate
  2. Get historical data from Compound/Graph Protocol API
  3. Run a small indexing script every minute which calls the getBorrowRate method and indexes this data for later use indexed by block
  """
  dataset = SqlDatabase(dataset_filename)

  # Filter blocks in target range
  filtered_dataset = dataset.selectInRange(start_block, end_block)

  # Validate dictionary has all the blocks in our range
  if not len(filtered_dataset) == end_block - start_block + 1:
      sys.exit(f"You are trying to get {end_block - start_block + 1} blocks but your dataset is missing {end_block - start_block + 1 - len(filtered_dataset)} block(s) in the range {start_block} to {end_block}")

  # Get list of all values (order doesn't matter for geometric mean)
  final_list = list(filtered_dataset.values())

  final_list = [1+(x/1e18) for x in final_list]
  return final_list

def geometricMean(dataset_list):
  return math.prod(dataset_list) ** (1/len(dataset_list))

# Geometric mean to get average per block return, then convert to APR
def getAPRforMonth(dataset_filename, start_block, end_block, expected_blocks_per_year):
  borrow_rate_of_block = getBorrowRatePerBlock(dataset_filename, start_block, end_block)
  avg_borrow_rate_per_block = geometricMean(borrow_rate_of_block)
  apr = avg_borrow_rate_per_block ** expected_blocks_per_year - 1.0
  return apr

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Calculate rolling 30 day geometric mean of Compound USDC borrow APR')
    parser.add_argument('dataset_filename', type=str, help='The file of the borrowRatePerBlock sqlite3 database dataset')
    parser.add_argument('--start-block', type=int, help='The block at the beginning of the 30 day period (inclusive)', required=True)
    parser.add_argument('--end-block', type=int, help='The block for the DVM price request (end of 30 day period, inclusive)', required=True)
    parser.add_argument('--expected-blocks-per-year', type=int, help='The expected number of ethereum blocks per year.', default=(6533 * 365))
    args = parser.parse_args()
    apr = getAPRforMonth(args.dataset_filename, args.start_block, args.end_block, args.expected_blocks_per_year)
    print(apr)
