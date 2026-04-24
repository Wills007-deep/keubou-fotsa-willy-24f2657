import sqlite3
import uuid
from datetime import datetime
import os

db_path = 'agroanalytics.db'
if not os.path.exists(db_path):
    db_path = 'backend/agroanalytics.db'

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Ensure admin00 exists
cursor.execute("SELECT id FROM users WHERE email = 'admin00'")
user = cursor.fetchone()
if not user:
    admin_id = str(uuid.uuid4())
    cursor.execute("INSERT INTO users (id, email, hashed_password, full_name, created_at) VALUES (?, ?, ?, ?, ?)",
                   (admin_id, 'admin00', 'tp-agro-2026', 'Admin', datetime.now().isoformat()))
    conn.commit()
    print(f"Created user admin00 with ID {admin_id}")
else:
    admin_id = user[0]
    print(f"User admin00 exists with ID {admin_id}")

# 2. Add user_id column if missing
cursor.execute("PRAGMA table_info(collectes)")
columns = [c[1] for c in cursor.fetchall()]
if 'user_id' not in columns:
    cursor.execute("ALTER TABLE collectes ADD COLUMN user_id TEXT REFERENCES users(id)")
    conn.commit()
    print("Added user_id column to collectes")

# 3. Assign all collections to admin00
cursor.execute("UPDATE collectes SET user_id = ?", (admin_id,))
conn.commit()
print(f"Assigned {cursor.rowcount} collectes to admin00")

conn.close()
