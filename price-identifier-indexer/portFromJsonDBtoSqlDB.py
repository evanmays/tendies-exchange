import time
start = time.time()
from database import Database
from sqlDatabase import SqlDatabase

old_cache = Database('borrow_rate_per_block.json').loadOrCreateDictionary()
new_cache = SqlDatabase("borrow_rate_per_block.db")

for k,v in old_cache.items():
    new_cache[k] = v

end = time.time()
print(f"Done in record time! {end - start} seconds")
