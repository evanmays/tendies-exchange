import time
from database import Database
from sqlDatabase import SqlDatabase

def ti(key, f):
  start = time.time()
  f()
  end = time.time()
  print(key, end - start)

keys = list(range(int(1e4)))
values = [k + 1 for k in keys]
cache = dict.fromkeys(keys, 3)
print("created")

def one():
  db = Database('borrow_rate_per_block.json')
  db.loadOrCreateDictionary()
  new = {}
  for k,v in cache.items():
    new[k] = v
    db.save(new)

fi = 'a.db'

def two():
  new_cache = SqlDatabase(fi)
  for k,v in cache.items():
    new_cache[k] = v
print("starting")
ti("A Test 1", one)
ti("A Test 2", one)
ti("A Test 3", one)

ti("B Test 1", two)
fi = 'b.db'
ti("B Test 2", two)
fi = 'c.db'
ti("B Test 3", two)
