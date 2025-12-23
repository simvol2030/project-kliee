-- Import Saatchi Art Products (Sample 4)
-- Run: sqlite3 ../data/db/sqlite/app.db < data/import-saatchi-products.sql

BEGIN TRANSACTION;

-- Product 1: Chebu-Rasha, Teletubbies (Featured)
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES (
  'chebu-rasha-teletubbies.jpg',
  '/uploads/products/chebu-rasha-teletubbies.jpg',
  'image/jpeg',
  21504,
  'Chebu-Rasha, Teletubbies',
  'Chebu-Rasha, Teletubbies',
  'Чебу-Раша, Телепузики',
  'Chebu-Rasha, Teletubbies',
  '切布拉莎，天线宝宝',
  CURRENT_TIMESTAMP
);

INSERT INTO artworks (
  slug, title_en, title_ru, title_es, title_zh,
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency,
  is_featured, is_for_sale, is_visible, order_index,
  created_at, updated_at
) VALUES (
  'chebu-rasha-teletubbies',
  'Chebu-Rasha, Teletubbies',
  'Чебу-Раша, Телепузики',
  'Chebu-Rasha, Teletubbies',
  '切布拉莎，天线宝宝',
  'Digital print on paper. Part of the surreal Chebu-Rasha series',
  'Цифровая печать на бумаге. Часть сюрреалистической серии Чебу-Раша',
  'Impresión digital en papel. Parte de la serie surrealista Chebu-Rasha',
  '数字印刷在纸上。超现实切布拉莎系列的一部分',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  1,
  1,
  1,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES (
  (SELECT id FROM artworks WHERE slug = 'chebu-rasha-teletubbies'),
  (SELECT id FROM media WHERE filename = 'chebu-rasha-teletubbies.jpg'),
  1,
  0
);

-- Product 2: Chebu-Rasha Throwing Up Eyes
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES (
  'chebu-rasha-throwing-eyes.jpg',
  '/uploads/products/chebu-rasha-throwing-eyes.jpg',
  'image/jpeg',
  22447,
  'Chebu-Rasha Throwing Up Eyes',
  'Chebu-Rasha Throwing Up Eyes',
  'Чебу-Раша Выбрасывающая Глаза',
  'Chebu-Rasha Lanzando Ojos',
  '切布拉莎抛眼睛',
  CURRENT_TIMESTAMP
);

INSERT INTO artworks (
  slug, title_en, title_ru, title_es, title_zh,
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency,
  is_featured, is_for_sale, is_visible, order_index,
  created_at, updated_at
) VALUES (
  'chebu-rasha-throwing-up-eyes',
  'Chebu-Rasha Throwing Up Eyes',
  'Чебу-Раша Выбрасывающая Глаза',
  'Chebu-Rasha Lanzando Ojos',
  '切布拉莎抛眼睛',
  'Digital print on paper. Surreal exploration of vision and perception',
  'Цифровая печать на бумаге. Сюрреалистическое исследование зрения и восприятия',
  'Impresión digital en papel. Exploración surrealista de visión y percepción',
  '数字印刷在纸上。关于视觉和感知的超现实探索',
  'Digital on Paper',
  '50 x 50 cm',
  2024,
  1466,
  'USD',
  1,
  1,
  1,
  2,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES (
  (SELECT id FROM artworks WHERE slug = 'chebu-rasha-throwing-up-eyes'),
  (SELECT id FROM media WHERE filename = 'chebu-rasha-throwing-eyes.jpg'),
  1,
  0
);

-- Product 3: Pink Bubbles Of Chebu-Rasha
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES (
  'pink-bubbles-long-ears.jpg',
  '/uploads/products/pink-bubbles-long-ears.jpg',
  'image/jpeg',
  28745,
  'Pink Bubbles Of Chebu-Rasha Or We Have Long Ears',
  'Pink Bubbles Of Chebu-Rasha Or We Have Long Ears',
  'Розовые Пузыри Чебу-Раши Или У Нас Длинные Уши',
  'Burbujas Rosas De Chebu-Rasha O Tenemos Orejas Largas',
  '切布拉莎的粉红泡泡或我们有长耳朵',
  CURRENT_TIMESTAMP
);

INSERT INTO artworks (
  slug, title_en, title_ru, title_es, title_zh,
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency,
  is_featured, is_for_sale, is_visible, order_index,
  created_at, updated_at
) VALUES (
  'pink-bubbles-of-chebu-rasha',
  'Pink Bubbles Of Chebu-Rasha Or We Have Long Ears',
  'Розовые Пузыри Чебу-Раши Или У Нас Длинные Уши',
  'Burbujas Rosas De Chebu-Rasha O Tenemos Orejas Largas',
  '切布拉莎的粉红泡泡或我们有长耳朵',
  'Digital print on paper. Playful exploration of identity and listening',
  'Цифровая печать на бумаге. Игровое исследование идентичности и слушания',
  'Impresión digital en papel. Exploración juguetona de identidad y escucha',
  '数字印刷在纸上。关于身份和倾听的有趣探索',
  'Digital on Paper',
  '40 x 50 cm',
  2024,
  1456,
  'USD',
  1,
  1,
  1,
  3,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES (
  (SELECT id FROM artworks WHERE slug = 'pink-bubbles-of-chebu-rasha'),
  (SELECT id FROM media WHERE filename = 'pink-bubbles-long-ears.jpg'),
  1,
  0
);

-- Product 4: Fire Breathing Chebu-Rasha
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES (
  'fire-breathing-chebu-rasha.jpg',
  '/uploads/products/fire-breathing-chebu-rasha.jpg',
  'image/jpeg',
  12093,
  'Fire Breathing Chebu-Rasha',
  'Fire Breathing Chebu-Rasha',
  'Огнедышащая Чебу-Раша',
  'Chebu-Rasha Escupiendo Fuego',
  '喷火的切布拉莎',
  CURRENT_TIMESTAMP
);

INSERT INTO artworks (
  slug, title_en, title_ru, title_es, title_zh,
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency,
  is_featured, is_for_sale, is_visible, order_index,
  created_at, updated_at
) VALUES (
  'fire-breathing-chebu-rasha',
  'Fire Breathing Chebu-Rasha',
  'Огнедышащая Чебу-Раша',
  'Chebu-Rasha Escupiendo Fuego',
  '喷火的切布拉莎',
  'Digital print on paper. Dynamic expression of inner fire and transformation',
  'Цифровая печать на бумаге. Динамическое выражение внутреннего огня и трансформации',
  'Impresión digital en papel. Expresión dinámica de fuego interior y transformación',
  '数字印刷在纸上。内在火焰和转变的动态表达',
  'Digital on Paper',
  '60 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  4,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES (
  (SELECT id FROM artworks WHERE slug = 'fire-breathing-chebu-rasha'),
  (SELECT id FROM media WHERE filename = 'fire-breathing-chebu-rasha.jpg'),
  1,
  0
);

COMMIT;

-- Verify import
SELECT 'Imported ' || COUNT(*) || ' products' FROM artworks WHERE slug LIKE '%chebu-rasha%';
SELECT 'Sample products:' as info;
SELECT id, slug, title_en, price || ' ' || currency as price FROM artworks WHERE slug LIKE '%chebu-rasha%' ORDER BY order_index;
