import sqlite3
import pandas as pd

def export_tables():
    conn = sqlite3.connect('04_Metadata/asset_database.db')
    
    # Get all tables
    tables = ['files', 'tags', 'file_tags', 'participants', 'file_participants', 'related_documents']
    
    for table in tables:
        try:
            # Read the table
            df = pd.read_sql_query(f"SELECT * FROM {table}", conn)
            
            # Format the date columns if they exist
            if 'date_modified' in df.columns:
                df['date_modified'] = pd.to_datetime(df['date_modified']).dt.strftime('%Y-%m-%d %H:%M:%S')
            if 'date_range_start' in df.columns:
                df['date_range_start'] = pd.to_datetime(df['date_range_start']).dt.strftime('%Y-%m-%d %H:%M:%S')
            if 'date_range_end' in df.columns:
                df['date_range_end'] = pd.to_datetime(df['date_range_end']).dt.strftime('%Y-%m-%d %H:%M:%S')
            
            # Rename columns to be more readable
            if table == 'files':
                df = df.rename(columns={
                    'id': 'file_id',
                    'file_name': 'name',
                    'file_path': 'path',
                    'file_type': 'type',
                    'document_category': 'category',
                    'sha256_hash': 'hash',
                    'date_modified': 'modified',
                    'ocr_text': 'ocr',
                    'summary': 'summary',
                    'date_range_start': 'range_start',
                    'date_range_end': 'range_end'
                })
            elif table == 'tags':
                df = df.rename(columns={
                    'id': 'tag_id',
                    'name': 'tag_name'
                })
            elif table == 'file_tags':
                df = df.rename(columns={
                    'file_id': 'file_id',
                    'tag_id': 'tag_id'
                })
            
            # Export with proper formatting
            csv_path = f'04_Metadata/{table}.csv'
            df.to_csv(csv_path, index=False, sep=',', encoding='utf-8')
            print(f"Exported {table} to {csv_path}")
        except Exception as e:
            print(f"Error exporting {table}: {e}")
    
    conn.close()

if __name__ == "__main__":
    export_tables()
