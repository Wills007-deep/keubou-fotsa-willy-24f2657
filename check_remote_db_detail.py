import psycopg2

DATABASE_URL = "postgresql://postgres.dhgqfdrjuxrlabopqfvo:O6mYavjmmK6LddDY@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    print("--- Users Detail ---")
    cur.execute("SELECT id, email, full_name FROM users;")
    for row in cur.fetchall():
        print(row)
        
    print("\n--- Collections Detail (First 5) ---")
    cur.execute("SELECT id_collecte, user_id, culture_type FROM collectes LIMIT 5;")
    for row in cur.fetchall():
        print(row)
        
    print("\n--- Current admin00 User ID ---")
    cur.execute("SELECT id FROM users WHERE email = 'admin00';")
    print(cur.fetchone())

    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
