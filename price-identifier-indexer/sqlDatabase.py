import sqlite3
class SqlDatabase():
    def __init__(self, filename):
        self.conn = sqlite3.connect(filename)
        self.cursor = self.conn.cursor()
        self.cursor.execute("CREATE TABLE IF NOT EXISTS compound (blockNumber INTEGER PRIMARY KEY, borrowRate INTEGER NOT NULL)")
        self.conn.commit()

    def __setitem__(self, key, value):
        self.cursor.execute("INSERT OR REPLACE INTO compound VALUES (?,?)", (key, value))
        self.conn.commit()

    def __getitem__(self, key):
        print(key)
        self.cursor.execute("SELECT borrowRate FROM compound WHERE blockNumber = ?", (key,))
        return self.cursor.fetchone()

    def __contains__(self, item):
        self.cursor.execute("SELECT borrowRate FROM compound WHERE blockNumber = ?", (item,))
        return not self.cursor.fetchone() is None
