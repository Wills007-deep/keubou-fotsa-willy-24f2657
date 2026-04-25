import psycopg2
import os

DATABASE_URL = "postgresql://postgres.dhgqfdrjuxrlabopqfvo:O6mYavjmmK6LddDY@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    print("--- Users ---")
    cur.execute("SELECT id, email FROM users;")
    users = cur.fetchall()
    for user in users:
        print(user)
        
    print("\n--- Collections Count per User ---")
    cur.execute("SELECT user_id, COUNT(*) FROM collectes GROUP BY user_id;")
    counts = cur.fetchall()
    for count in counts:
        print(count)
        
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
