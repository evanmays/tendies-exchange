import json
import sys
import time
from web3 import Web3
from database import Database

CONFIRMATIONS_REQUIRED = 20
WINDOW_SIZE = 100
FILENAME = "borrow_rate_per_block.json"
PROVIDER_URL = ""
COMPOUND_USDC_ADDRESS = "0x39AA39c021dfbaE8faC545936693aC917d5E7563"
COMPOUND_USDC_ABI_FILE = "cUSDC_ABI.json"

assert PROVIDER_URL, "Please give a ethereum node URL"

def getUSDCTokenContract(web3):
    with open(COMPOUND_USDC_ABI_FILE) as compound_usdc_abi:
        abi = json.load(compound_usdc_abi)
        return web3.eth.contract(abi=abi, address=COMPOUND_USDC_ADDRESS)

db = Database(FILENAME)
cache = db.loadOrCreateDictionary()
web3 = Web3(Web3.HTTPProvider(PROVIDER_URL))
cUSDC = getUSDCTokenContract(web3)

print("Entering infinite loop")

while True:
    if not web3.isConnected():
        print("Your web3 provider disconnected. Attempting to reconnect...")
        try:
            web3 = Web3(Web3.HTTPProvider(PROVIDER_URL))
        except:
            sys.exit("Unable to reconnect.")

    current_block = web3.eth.blockNumber
    endBlock = current_block - CONFIRMATIONS_REQUIRED
    startBlock = endBlock - WINDOW_SIZE

    for i in range(startBlock, endBlock):
        if i not in cache:
            print("Retriving borrow rate from block", i)
            borrow_rate = cUSDC.functions.borrowRatePerBlock().call(block_identifier=i)
            cache[i] = borrow_rate
            db.save(cache)

    print("Sleep for 5 seconds")
    time.sleep(5)
