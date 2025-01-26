import sqlite3
import pandas as pd

def show_tables():
    conn = sqlite3.connect('04_Metadata/asset_database.db')
    
    # Get all tables
    tables = ['files', 'tags', 'file_tags', 'participants', 'file_participants', 'related_documents']
    
    for table in tables:
        print(f"\n=== {table} ===")
        try:
            df = pd.read_sql_query(f"SELECT * FROM {table}", conn)
            # Set display options for better formatting
            pd.set_option('display.max_columns', None)
            pd.set_option('display.width', None)
            pd.set_option('display.max_colwidth', None)
            print(df.to_string(index=False))
        except Exception as e:
            print(f"Error reading {table}: {e}")
    
    conn.close()

if __name__ == "__main__":
    show_tables()
