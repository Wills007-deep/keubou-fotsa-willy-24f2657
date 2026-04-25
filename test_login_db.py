import os
import sys

# Setup mock environment
os.environ["DATABASE_URL"] = "postgresql://postgres.dhgqfdrjuxrlabopqfvo:O6mYavjmmK6LddDY@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    import backend.database as database
    import backend.models as models
    
    print("Testing connection...")
    db = database.SessionLocal()
    user = db.query(models.User).filter(models.User.email == "admin00").first()
    print("User found:", user)
except Exception as e:
    import traceback
    traceback.print_exc()
