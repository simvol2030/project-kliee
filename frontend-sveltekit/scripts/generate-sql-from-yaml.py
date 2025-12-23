#!/usr/bin/env python3
"""
Generate full SQL import script from YAML file
"""
import yaml
import re

def slugify(text):
    """Convert title to URL-friendly slug"""
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'^-|-$', '', text)
    return text

def escape_sql(text):
    """Escape single quotes for SQL"""
    return text.replace("'", "''")

# Read YAML file
with open('data/products-saatchi-complete.yaml', 'r', encoding='utf-8') as f:
    data = yaml.safe_load(f)

products = data['products']

# Generate SQL
sql = """-- Import All 37 Saatchi Art Products
-- Database: SQLite at /opt/websites/k-liee.com/data/db/sqlite/app.db
-- Run: sqlite3 /opt/websites/k-liee.com/data/db/sqlite/app.db < import-all-saatchi-products.sql

BEGIN TRANSACTION;

"""

for idx, product in enumerate(products, 1):
    slug = slugify(product['title_en'])

    # Escape SQL strings
    title_en = escape_sql(product['title_en'])
    title_ru = escape_sql(product['title_ru'])
    title_es = escape_sql(product['title_es'])
    title_zh = escape_sql(product['title_zh'])
    desc_en = escape_sql(product['description_en'])
    desc_ru = escape_sql(product['description_ru'])
    desc_es = escape_sql(product['description_es'])
    desc_zh = escape_sql(product['description_zh'])
    medium = escape_sql(product['medium'])
    dimensions = escape_sql(product['dimensions'])
    filename = escape_sql(product['image_filename'])

    is_featured = 1 if product.get('is_featured', False) else 0
    is_for_sale = 1 if product.get('is_available', True) else 0

    sql += f"""-- Product {idx}: {product['title_en']}
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES ('{filename}', '/uploads/products/{filename}', 'image/jpeg', 20480,
  '{title_en}', '{title_en}', '{title_ru}', '{title_es}', '{title_zh}', CURRENT_TIMESTAMP);

INSERT INTO artworks (slug, title_en, title_ru, title_es, title_zh, description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, is_featured, is_for_sale, is_visible, order_index, created_at, updated_at)
VALUES ('{slug}', '{title_en}', '{title_ru}', '{title_es}', '{title_zh}',
  '{desc_en}', '{desc_ru}', '{desc_es}', '{desc_zh}',
  '{medium}', '{dimensions}', {product['year']}, {product['price']}, 'USD', {is_featured}, {is_for_sale}, 1, {idx}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES ((SELECT id FROM artworks WHERE slug = '{slug}'),
  (SELECT id FROM media WHERE filename = '{filename}'), 1, 0);

"""

sql += """COMMIT;

-- Verify import
SELECT 'Imported ' || COUNT(*) || ' products' as result FROM artworks;
SELECT 'Total media files: ' || COUNT(*) as result FROM media;
SELECT 'Featured products: ' || COUNT(*) as result FROM artworks WHERE is_featured = 1;
"""

# Write SQL file
with open('data/import-all-37-saatchi-products.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print(f"✅ Generated SQL for {len(products)} products")
print(f"📁 Output: data/import-all-37-saatchi-products.sql")
