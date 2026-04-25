import psycopg2

DATABASE_URL = "postgresql://postgres.dhgqfdrjuxrlabopqfvo:O6mYavjmmK6LddDY@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Get current admin00 ID
    cur.execute("SELECT id FROM users WHERE email = 'admin00';")
    admin_id = cur.fetchone()[0]
    print(f"Current admin00 ID: {admin_id}")
    
    # Assign all orphaned or misassigned collections to this ID
    cur.execute("UPDATE collectes SET user_id = %s;", (admin_id,))
    conn.commit()
    print(f"Successfully reassigned {cur.rowcount} collections to admin00.")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
