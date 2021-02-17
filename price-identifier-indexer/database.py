import json

def int_keys(ordered_pairs):
    result = {}
    for key, value in ordered_pairs:
        try:
            key = int(key)
        except ValueError:
            pass
        result[key] = value
    return result

class Database:
    def __init__(self, filename):
        self.filename = filename

    def save(self, dictionary):
        with open(self.filename, "w") as outfile:
            #TODO: if the dump fails (one reason could be keys of different type thus aren't comparable insort), then we lose the old contents of the file. Failures delete all of our data!
            json.dump(dictionary, outfile, sort_keys=True, indent=4)

    def loadOrCreateDictionary(self):
        try:
            with open(self.filename) as infile:
                return json.load(infile, object_pairs_hook=int_keys)
        except:
            return {}
