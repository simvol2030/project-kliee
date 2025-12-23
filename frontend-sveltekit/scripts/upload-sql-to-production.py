#!/usr/bin/env python3
"""
Upload SQL file to production server via base64 encoding
"""
import base64

# Read SQL file
with open('data/import-all-37-saatchi-products.sql', 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Encode to base64
sql_base64 = base64.b64encode(sql_content.encode('utf-8')).decode('utf-8')

# Output base64 for transfer
print(sql_base64)
