import json
import sys
import time
from web3 import Web3
from sqlDatabase import SqlDatabase
import argparse

CONFIRMATIONS_REQUIRED = 20
COMPOUND_USDC_ADDRESS = "0x39AA39c021dfbaE8faC545936693aC917d5E7563"
COMPOUND_USDC_ABI_FILE = "cUSDC_ABI.json"

parser = argparse.ArgumentParser(description='Index Compound USDC borrow rate per block into a sqlite3 Database')
parser.add_argument('--dataset-filename', type=str, help='The file of the borrowRatePerBlock sqlite3 database', default="borrow_rate_per_block.db")
parser.add_argument('--provider-url', type=str, help='The URL of your ethereum node', required=True)
parser.add_argument('--window-size', type=int, help='On every loop, we check the past window-size blocks to see if any need to be indexed', default=100)

args = parser.parse_args()

def getUSDCTokenContract(web3):
    with open(COMPOUND_USDC_ABI_FILE) as compound_usdc_abi:
        abi = json.load(compound_usdc_abi)
        return web3.eth.contract(abi=abi, address=COMPOUND_USDC_ADDRESS)

cache = SqlDatabase(args.dataset_filename)
web3 = Web3(Web3.HTTPProvider(args.provider_url))
cUSDC = getUSDCTokenContract(web3)

print("Entering infinite loop")

while True:
    if not web3.isConnected():
        print("Your web3 provider disconnected. Attempting to reconnect...")
        try:
            web3 = Web3(Web3.HTTPProvider(args.provider_url))
        except:
            sys.exit("Unable to reconnect.")

    current_block = web3.eth.blockNumber
    endBlock = current_block - CONFIRMATIONS_REQUIRED
    startBlock = endBlock - args.window_size

    for i in range(startBlock, endBlock):
        if i not in cache:
            print("Retriving borrow rate from block", i)
            borrow_rate = cUSDC.functions.borrowRatePerBlock().call(block_identifier=i)
            cache[i] = borrow_rate

    print("Sleep for 5 seconds")
    time.sleep(5)
