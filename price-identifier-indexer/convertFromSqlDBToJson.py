# Setup
import json
from sqlDatabase import SqlDatabase
from database import Database
import argparse

parser = argparse.ArgumentParser(description='Calculate rolling 30 day geometric mean of Compound USDC borrow APR')
parser.add_argument('input_dataset_filename', type=str, help='The file of the borrowRatePerBlock sqlite3 database dataset')
parser.add_argument('output_dataset_filename', type=str, help='The file to save json into')
args = parser.parse_args()

# Sqlite3 Database File => Dictionary
dataset = SqlDatabase(args.input_dataset_filename)
dataset_dict = dataset.selectInRange(0, int(1e14))

# Dictionary => Json File
json_file = Database(args.output_dataset_filename)
json_file.save(dataset_dict)
