import sqlite3
import os

db_path = 'backend/agroanalytics.db'
if not os.path.exists(db_path):
    print(f"File {db_path} not found")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(collectes)")
columns = cursor.fetchall()
for col in columns:
    print(col)
conn.close()
