#!/bin/bash
# Simple SQL import for Saatchi Art products

DB_PATH="../data/db/sqlite/app.db"

echo "🚀 Importing Saatchi Art products via SQL..."

# Sample product 1
sqlite3 "$DB_PATH" <<'EOF'
-- Insert media
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh)
VALUES (
  'chebu-rasha-teletubbies.jpg',
  '/uploads/products/chebu-rasha-teletubbies.jpg',
  'image/jpeg',
  0,
  'Chebu-Rasha, Teletubbies',
  'Chebu-Rasha, Teletubbies',
  'Чебу-Раша, Телепузики',
  'Chebu-Rasha, Teletubbies',
  '切布拉莎，天线宝宝'
);

-- Get last inserted media ID
SELECT last_insert_rowid() as media_id;

-- Insert artwork (using hardcoded media_id from above)
INSERT INTO artworks (
  slug, title_en, title_ru, title_es, title_zh,
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency,
  is_featured, is_for_sale, is_visible
) VALUES (
  'chebu-rasha-teletubbies',
  'Chebu-Rasha, Teletubbies',
  'Чебу-Раша, Телепузики',
  'Chebu-Rasha, Teletubbies',
  '切布拉莎，天线宝宝',
  'Digital print on paper',
  'Цифровая печать на бумаге',
  'Impresión digital en papel',
  '数字印刷在纸上',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  1,
  1,
  1
);

SELECT '✓ Product imported: Chebu-Rasha, Teletubbies';
EOF

echo "✅ Import complete!"
echo "Next: Download images manually to static/uploads/products/"
