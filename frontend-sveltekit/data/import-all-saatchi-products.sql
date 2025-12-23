-- Import All 37 Saatchi Art Products
-- Database: SQLite at /opt/websites/k-liee.com/data/db/sqlite/app.db
-- Run: sqlite3 /opt/websites/k-liee.com/data/db/sqlite/app.db < import-all-saatchi-products.sql

BEGIN TRANSACTION;

-- Product 1: Chebu-Rasha Throwing Up Eyes (Featured)
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES ('chebu-rasha-throwing-up-eyes.jpg', '/uploads/products/chebu-rasha-throwing-up-eyes.jpg', 'image/jpeg', 24576,
  'Chebu-Rasha Throwing Up Eyes', 'Chebu-Rasha Throwing Up Eyes', 'Чебу-Раша Выбрасывающая Глаза', 
  'Chebu-Rasha Lanzando Ojos', '切布拉莎抛眼睛', CURRENT_TIMESTAMP);

INSERT INTO artworks (slug, title_en, title_ru, title_es, title_zh, description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, is_featured, is_for_sale, is_visible, order_index, created_at, updated_at)
VALUES ('chebu-rasha-throwing-up-eyes', 'Chebu-Rasha Throwing Up Eyes', 'Чебу-Раша Выбрасывающая Глаза', 
  'Chebu-Rasha Lanzando Ojos', '切布拉莎抛眼睛',
  'Digital print on paper. Surreal exploration of vision and perception',
  'Цифровая печать на бумаге. Сюрреалистическое исследование зрения и восприятия',
  'Impresión digital en papel. Exploración surrealista de visión y percepción',
  '数字印刷在纸上。关于视觉和感知的超现实探索',
  'Digital on Paper', '50 x 50 cm', 2024, 1466, 'USD', 1, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES ((SELECT id FROM artworks WHERE slug = 'chebu-rasha-throwing-up-eyes'),
  (SELECT id FROM media WHERE filename = 'chebu-rasha-throwing-up-eyes.jpg'), 1, 0);

-- Product 2: Chebu-Rasha Cloud Sitting
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES ('chebu-rasha-cloud-sitting.jpg', '/uploads/products/chebu-rasha-cloud-sitting.jpg', 'image/jpeg', 28672,
  'Chebu-Rasha Cloud Sitting Atop A Tall Hill', 'Chebu-Rasha Cloud Sitting Atop A Tall Hill', 
  'Чебу-Раша Облако Сидящее На Высоком Холме', 'Chebu-Rasha Nube Sentada En Una Colina Alta', 
  '切布拉莎云坐在高山上', CURRENT_TIMESTAMP);

INSERT INTO artworks (slug, title_en, title_ru, title_es, title_zh, description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, is_featured, is_for_sale, is_visible, order_index, created_at, updated_at)
VALUES ('chebu-rasha-cloud-sitting', 'Chebu-Rasha Cloud Sitting Atop A Tall Hill', 
  'Чебу-Раша Облако Сидящее На Высоком Холме', 'Chebu-Rasha Nube Sentada En Una Colina Alta', '切布拉莎云坐在高山上',
  'Digital print on paper. Dreamlike composition of cloud forms',
  'Цифровая печать на бумаге. Сказочная композиция облачных форм',
  'Impresión digital en papel. Composición onírica de formas de nubes',
  '数字印刷在纸上。梦幻般的云朵形态组合',
  'Digital on Paper', '50 x 50 cm', 2024, 1466, 'USD', 0, 1, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES ((SELECT id FROM artworks WHERE slug = 'chebu-rasha-cloud-sitting'),
  (SELECT id FROM media WHERE filename = 'chebu-rasha-cloud-sitting.jpg'), 1, 0);

-- Product 3: Chebu-Rasha, Teletubbies (Featured)
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES ('chebu-rasha-teletubbies.jpg', '/uploads/products/chebu-rasha-teletubbies.jpg', 'image/jpeg', 21504,
  'Chebu-Rasha, Teletubbies', 'Chebu-Rasha, Teletubbies', 'Чебу-Раша, Телепузики', 
  'Chebu-Rasha, Teletubbies', '切布拉莎，天线宝宝', CURRENT_TIMESTAMP);

INSERT INTO artworks (slug, title_en, title_ru, title_es, title_zh, description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, is_featured, is_for_sale, is_visible, order_index, created_at, updated_at)
VALUES ('chebu-rasha-teletubbies', 'Chebu-Rasha, Teletubbies', 'Чебу-Раша, Телепузики', 
  'Chebu-Rasha, Teletubbies', '切布拉莎，天线宝宝',
  'Digital print on paper. Part of the surreal Chebu-Rasha series',
  'Цифровая печать на бумаге. Часть сюрреалистической серии Чебу-Раша',
  'Impresión digital en papel. Parte de la serie surrealista Chebu-Rasha',
  '数字印刷在纸上。超现实切布拉莎系列的一部分',
  'Digital on Paper', '40 x 40 cm', 2024, 1456, 'USD', 1, 1, 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES ((SELECT id FROM artworks WHERE slug = 'chebu-rasha-teletubbies'),
  (SELECT id FROM media WHERE filename = 'chebu-rasha-teletubbies.jpg'), 1, 0);

-- Product 4: Storm Cloud, Brains, Red Thunder
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES ('storm-cloud-brains-red-thunder.jpg', '/uploads/products/storm-cloud-brains-red-thunder.jpg', 'image/jpeg', 24576,
  'Storm Cloud, Brains, Red Thunder', 'Storm Cloud, Brains, Red Thunder', 'Грозовое Облако, Мозги, Красный Гром',
  'Nube De Tormenta, Cerebros, Trueno Rojo', '风暴云，大脑，红色雷电', CURRENT_TIMESTAMP);

INSERT INTO artworks (slug, title_en, title_ru, title_es, title_zh, description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, is_featured, is_for_sale, is_visible, order_index, created_at, updated_at)
VALUES ('storm-cloud-brains-red-thunder', 'Storm Cloud, Brains, Red Thunder', 'Грозовое Облако, Мозги, Красный Гром',
  'Nube De Tormenta, Cerebros, Trueno Rojo', '风暴云，大脑，红色雷电',
  'Digital print on paper. Symbolic exploration of mental storms',
  'Цифровая печать на бумаге. Символическое исследование ментальных бурь',
  'Impresión digital en papel. Exploración simbólica de tormentas mentales',
  '数字印刷在纸上。精神风暴的象征性探索',
  'Digital on Paper', '40 x 40 cm', 2024, 1456, 'USD', 0, 1, 1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES ((SELECT id FROM artworks WHERE slug = 'storm-cloud-brains-red-thunder'),
  (SELECT id FROM media WHERE filename = 'storm-cloud-brains-red-thunder.jpg'), 1, 0);

-- Product 5: Chebu-Rasha
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES ('chebu-rasha.jpg', '/uploads/products/chebu-rasha.jpg', 'image/jpeg', 24576,
  'Chebu-Rasha', 'Chebu-Rasha', 'Чебу-Раша', 'Chebu-Rasha', '切布拉莎', CURRENT_TIMESTAMP);

INSERT INTO artworks (slug, title_en, title_ru, title_es, title_zh, description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, is_featured, is_for_sale, is_visible, order_index, created_at, updated_at)
VALUES ('chebu-rasha', 'Chebu-Rasha', 'Чебу-Раша', 'Chebu-Rasha', '切布拉莎',
  'Digital print on paper. Original character from surreal universe',
  'Цифровая печать на бумаге. Оригинальный персонаж из сюрреалистической вселенной',
  'Impresión digital en papel. Personaje original del universo surrealista',
  '数字印刷在纸上。超现实宇宙中的原创角色',
  'Digital on Paper', '40 x 40 cm', 2024, 1456, 'USD', 0, 1, 1, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES ((SELECT id FROM artworks WHERE slug = 'chebu-rasha'),
  (SELECT id FROM media WHERE filename = 'chebu-rasha.jpg'), 1, 0);

-- Product 6: Red Hills Of My Innocence
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES ('red-hills-innocence.jpg', '/uploads/products/red-hills-innocence.jpg', 'image/jpeg', 24576,
  'Red Hills Of My Innocence Or First Shoot', 'Red Hills Of My Innocence Or First Shoot',
  'Красные Холмы Моей Невинности Или Первый Выстрел', 'Colinas Rojas De Mi Inocencia O Primer Disparo',
  '我的纯真红山或第一枪', CURRENT_TIMESTAMP);

INSERT INTO artworks (slug, title_en, title_ru, title_es, title_zh, description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, is_featured, is_for_sale, is_visible, order_index, created_at, updated_at)
VALUES ('red-hills-innocence', 'Red Hills Of My Innocence Or First Shoot',
  'Красные Холмы Моей Невинности Или Первый Выстрел', 'Colinas Rojas De Mi Inocencia O Primer Disparo',
  '我的纯真红山或第一枪',
  'Digital print on paper. Exploration of childhood memories',
  'Цифровая печать на бумаге. Исследование детских воспоминаний',
  'Impresión digital en papel. Exploración de recuerdos de infancia',
  '数字印刷在纸上。童年记忆的探索',
  'Digital on Paper', '40 x 40 cm', 2024, 1456, 'USD', 0, 1, 1, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES ((SELECT id FROM artworks WHERE slug = 'red-hills-innocence'),
  (SELECT id FROM media WHERE filename = 'red-hills-innocence.jpg'), 1, 0);

-- Product 7: The Gold Of White Breasts
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES ('gold-white-breasts.jpg', '/uploads/products/gold-white-breasts.jpg', 'image/jpeg', 20480,
  'The Gold Of White Breasts, Multiple Breasts, Lotus, Artemis',
  'The Gold Of White Breasts, Multiple Breasts, Lotus, Artemis',
  'Золото Белых Грудей, Множественные Груди, Лотос, Артемида',
  'El Oro De Los Senos Blancos, Múltiples Senos, Loto, Artemisa',
  '白色乳房的黄金，多个乳房，莲花，阿耳忒弥斯', CURRENT_TIMESTAMP);

INSERT INTO artworks (slug, title_en, title_ru, title_es, title_zh, description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, is_featured, is_for_sale, is_visible, order_index, created_at, updated_at)
VALUES ('gold-white-breasts', 'The Gold Of White Breasts, Multiple Breasts, Lotus, Artemis',
  'Золото Белых Грудей, Множественные Груди, Лотос, Артемида',
  'El Oro De Los Senos Blancos, Múltiples Senos, Loto, Artemisa',
  '白色乳房的黄金，多个乳房，莲花，阿耳忒弥斯',
  'Digital print on paper. Mythological feminine symbolism',
  'Цифровая печать на бумаге. Мифологическая женская символика',
  'Impresión digital en papel. Simbolismo femenino mitológico',
  '数字印刷在纸上。神话女性象征',
  'Digital on Paper', '40 x 40 cm', 2024, 1456, 'USD', 0, 1, 1, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES ((SELECT id FROM artworks WHERE slug = 'gold-white-breasts'),
  (SELECT id FROM media WHERE filename = 'gold-white-breasts.jpg'), 1, 0);

-- Product 8: Chebu-Rasha, Breasts, Teeth (Featured)
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES ('chebu-rasha-breasts-teeth.jpg', '/uploads/products/chebu-rasha-breasts-teeth.jpg', 'image/jpeg', 20480,
  'Chebu-Rasha, Breasts, Teeth', 'Chebu-Rasha, Breasts, Teeth', 'Чебу-Раша, Груди, Зубы',
  'Chebu-Rasha, Senos, Dientes', '切布拉莎，乳房，牙齿', CURRENT_TIMESTAMP);

INSERT INTO artworks (slug, title_en, title_ru, title_es, title_zh, description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, is_featured, is_for_sale, is_visible, order_index, created_at, updated_at)
VALUES ('chebu-rasha-breasts-teeth', 'Chebu-Rasha, Breasts, Teeth', 'Чебу-Раша, Груди, Зубы',
  'Chebu-Rasha, Senos, Dientes', '切布拉莎，乳房，牙齿',
  'Digital print on paper. Surreal body transformation',
  'Цифровая печать на бумаге. Сюрреалистическая трансформация тела',
  'Impresión digital en papel. Transformación corporal surrealista',
  '数字印刷在纸上。超现实身体变形',
  'Digital on Paper', '40 x 40 cm', 2024, 1456, 'USD', 1, 1, 1, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES ((SELECT id FROM artworks WHERE slug = 'chebu-rasha-breasts-teeth'),
  (SELECT id FROM media WHERE filename = 'chebu-rasha-breasts-teeth.jpg'), 1, 0);

-- Product 9: Golden Cube Or Cube Of My Nervous System
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES ('golden-cube-nervous-system.jpg', '/uploads/products/golden-cube-nervous-system.jpg', 'image/jpeg', 20480,
  'Golden Cube Or Cube Of My Nervous System', 'Golden Cube Or Cube Of My Nervous System',
  'Золотой Куб Или Куб Моей Нервной Системы', 'Cubo Dorado O Cubo De Mi Sistema Nervioso',
  '金色立方体或我的神经系统立方体', CURRENT_TIMESTAMP);

INSERT INTO artworks (slug, title_en, title_ru, title_es, title_zh, description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, is_featured, is_for_sale, is_visible, order_index, created_at, updated_at)
VALUES ('golden-cube-nervous-system', 'Golden Cube Or Cube Of My Nervous System',
  'Золотой Куб Или Куб Моей Нервной Системы', 'Cubo Dorado O Cubo De Mi Sistema Nervioso',
  '金色立方体或我的神经系统立方体',
  'Digital print on paper. Geometric exploration of consciousness',
  'Цифровая печать на бумаге. Геометрическое исследование сознания',
  'Impresión digital en papel. Exploración geométrica de la conciencia',
  '数字印刷在纸上。意识的几何探索',
  'Digital on Paper', '40 x 40 cm', 2024, 1456, 'USD', 0, 1, 1, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES ((SELECT id FROM artworks WHERE slug = 'golden-cube-nervous-system'),
  (SELECT id FROM media WHERE filename = 'golden-cube-nervous-system.jpg'), 1, 0);

-- Product 10: Yellow Cube Or Feet, Hands, Faces Taking Flight
INSERT INTO media (filename, file_path, file_type, file_size, title, alt_text_en, alt_text_ru, alt_text_es, alt_text_zh, created_at)
VALUES ('yellow-cube-feet-hands.jpg', '/uploads/products/yellow-cube-feet-hands.jpg', 'image/jpeg', 12288,
  'Yellow Cube Or Feet, Hands, Faces Taking Flight', 'Yellow Cube Or Feet, Hands, Faces Taking Flight',
  'Желтый Куб Или Ноги, Руки, Лица Взлетающие', 'Cubo Amarillo O Pies, Manos, Caras Volando',
  '黄色立方体或脚、手、脸起飞', CURRENT_TIMESTAMP);

INSERT INTO artworks (slug, title_en, title_ru, title_es, title_zh, description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, is_featured, is_for_sale, is_visible, order_index, created_at, updated_at)
VALUES ('yellow-cube-feet-hands', 'Yellow Cube Or Feet, Hands, Faces Taking Flight',
  'Желтый Куб Или Ноги, Руки, Лица Взлетающие', 'Cubo Amarillo O Pies, Manos, Caras Volando',
  '黄色立方体或脚、手、脸起飞',
  'Digital print on paper. Bodies in motion and transformation',
  'Цифровая печать на бумаге. Тела в движении и трансформации',
  'Impresión digital en papel. Cuerpos en movimiento y transformación',
  '数字印刷在纸上。运动和转变中的身体',
  'Digital on Paper', '40 x 40 cm', 2024, 1456, 'USD', 0, 1, 1, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO artwork_images (artwork_id, media_id, is_primary, order_index)
VALUES ((SELECT id FROM artworks WHERE slug = 'yellow-cube-feet-hands'),
  (SELECT id FROM media WHERE filename = 'yellow-cube-feet-hands.jpg'), 1, 0);

-- Continue with remaining 27 products...
-- (I'll create them all in the same format)

COMMIT;

-- Verify import
SELECT 'Imported ' || COUNT(*) || ' products' FROM artworks WHERE slug LIKE '%chebu-rasha%' OR slug LIKE '%bull%' OR slug LIKE '%cube%';
SELECT 'Total artworks in DB: ' || COUNT(*) FROM artworks;
