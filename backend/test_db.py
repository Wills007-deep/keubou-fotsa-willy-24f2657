import os
import traceback
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

url = "postgresql://postgres.dhgqfdrjuxrlabopqfvo:O6mYavjmmK6LddDY@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

try:
    engine = create_engine(url)
    engine.connect()
    print("Database connection successful")
except Exception as e:
    print("Database connection failed!")
    traceback.print_exc()
