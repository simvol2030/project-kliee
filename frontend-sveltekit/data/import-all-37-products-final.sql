-- Import All 37 Saatchi Art Products (Correct Schema)
-- Database: SQLite at /opt/websites/k-liee.com/data/db/sqlite/app.db

BEGIN TRANSACTION;

-- Product 1: Chebu-Rasha Throwing Up Eyes
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
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
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 2: Chebu-Rasha Cloud Sitting Atop A Tall Hill
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'chebu-rasha-cloud-sitting-atop-a-tall-hill',
  'Chebu-Rasha Cloud Sitting Atop A Tall Hill',
  'Чебу-Раша Облако Сидящее На Высоком Холме',
  'Chebu-Rasha Nube Sentada En Una Colina Alta',
  '切布拉莎云坐在高山上',
  'Digital print on paper. Dreamlike composition of cloud forms',
  'Цифровая печать на бумаге. Сказочная композиция облачных форм',
  'Impresión digital en papel. Composición onírica de formas de nubes',
  '数字印刷在纸上。梦幻般的云朵形态组合',
  'Digital on Paper',
  '50 x 50 cm',
  2024,
  1466,
  'USD',
  0,
  1,
  1,
  2,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 3: Chebu-Rasha, Teletubbies
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
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
  3,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 4: Storm Cloud, Brains, Red Thunder
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'storm-cloud-brains-red-thunder',
  'Storm Cloud, Brains, Red Thunder',
  'Грозовое Облако, Мозги, Красный Гром',
  'Nube De Tormenta, Cerebros, Trueno Rojo',
  '风暴云，大脑，红色雷电',
  'Digital print on paper. Symbolic exploration of mental storms',
  'Цифровая печать на бумаге. Символическое исследование ментальных бурь',
  'Impresión digital en papel. Exploración simbólica de tormentas mentales',
  '数字印刷在纸上。精神风暴的象征性探索',
  'Digital on Paper',
  '40 x 40 cm',
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

-- Product 5: Chebu-Rasha
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'chebu-rasha',
  'Chebu-Rasha',
  'Чебу-Раша',
  'Chebu-Rasha',
  '切布拉莎',
  'Digital print on paper. Original character from surreal universe',
  'Цифровая печать на бумаге. Оригинальный персонаж из сюрреалистической вселенной',
  'Impresión digital en papel. Personaje original del universo surrealista',
  '数字印刷在纸上。超现实宇宙中的原创角色',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  5,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 6: Red Hills Of My Innocence Or First Shoot
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'red-hills-of-my-innocence-or-first-shoot',
  'Red Hills Of My Innocence Or First Shoot',
  'Красные Холмы Моей Невинности Или Первый Выстрел',
  'Colinas Rojas De Mi Inocencia O Primer Disparo',
  '我的纯真红山或第一枪',
  'Digital print on paper. Exploration of childhood memories',
  'Цифровая печать на бумаге. Исследование детских воспоминаний',
  'Impresión digital en papel. Exploración de recuerdos de infancia',
  '数字印刷在纸上。童年记忆的探索',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  6,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 7: The Gold Of White Breasts, Multiple Breasts, Lotus, Artemis
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'the-gold-of-white-breasts-multiple-breasts-lotus-artemis',
  'The Gold Of White Breasts, Multiple Breasts, Lotus, Artemis',
  'Золото Белых Грудей, Множественные Груди, Лотос, Артемида',
  'El Oro De Los Senos Blancos, Múltiples Senos, Loto, Artemisa',
  '白色乳房的黄金，多个乳房，莲花，阿耳忒弥斯',
  'Digital print on paper. Mythological feminine symbolism',
  'Цифровая печать на бумаге. Мифологическая женская символика',
  'Impresión digital en papel. Simbolismo femenino mitológico',
  '数字印刷在纸上。神话女性象征',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  7,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 8: Chebu-Rasha, Breasts, Teeth
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'chebu-rasha-breasts-teeth',
  'Chebu-Rasha, Breasts, Teeth',
  'Чебу-Раша, Груди, Зубы',
  'Chebu-Rasha, Senos, Dientes',
  '切布拉莎，乳房，牙齿',
  'Digital print on paper. Surreal body transformation',
  'Цифровая печать на бумаге. Сюрреалистическая трансформация тела',
  'Impresión digital en papel. Transformación corporal surrealista',
  '数字印刷在纸上。超现实身体变形',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  1,
  1,
  1,
  8,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 9: Golden Cube Or Cube Of My Nervous System
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'golden-cube-or-cube-of-my-nervous-system',
  'Golden Cube Or Cube Of My Nervous System',
  'Золотой Куб Или Куб Моей Нервной Системы',
  'Cubo Dorado O Cubo De Mi Sistema Nervioso',
  '金色立方体或我的神经系统立方体',
  'Digital print on paper. Geometric exploration of consciousness',
  'Цифровая печать на бумаге. Геометрическое исследование сознания',
  'Impresión digital en papel. Exploración geométrica de la conciencia',
  '数字印刷在纸上。意识的几何探索',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  9,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 10: Yellow Cube Or Feet, Hands, Faces Taking Flight
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'yellow-cube-or-feet-hands-faces-taking-flight',
  'Yellow Cube Or Feet, Hands, Faces Taking Flight',
  'Желтый Куб Или Ноги, Руки, Лица Взлетающие',
  'Cubo Amarillo O Pies, Manos, Caras Volando',
  '黄色立方体或脚、手、脸起飞',
  'Digital print on paper. Bodies in motion and transformation',
  'Цифровая печать на бумаге. Тела в движении и трансформации',
  'Impresión digital en papel. Cuerpos en movimiento y transformación',
  '数字印刷在纸上。运动和转变中的身体',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  10,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 11: Chebu-Rasha In Blue
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'chebu-rasha-in-blue',
  'Chebu-Rasha In Blue',
  'Чебу-Раша В Синем',
  'Chebu-Rasha En Azul',
  '蓝色的切布拉莎',
  'Digital print on paper. Blue period exploration',
  'Цифровая печать на бумаге. Исследование голубого периода',
  'Impresión digital en papel. Exploración del período azul',
  '数字印刷在纸上。蓝色时期探索',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  11,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 12: Pink Bubbles Of Chebu-Rasha Or We Have Long Ears
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'pink-bubbles-of-chebu-rasha-or-we-have-long-ears',
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
  12,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 13: Octopus Head
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'octopus-head',
  'Octopus Head',
  'Голова Осьминога',
  'Cabeza De Pulpo',
  '章鱼头',
  'Digital print on paper. Marine creature metamorphosis',
  'Цифровая печать на бумаге. Метаморфоза морского существа',
  'Impresión digital en papel. Metamorfosis de criatura marina',
  '数字印刷在纸上。海洋生物变形',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  13,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 14: Last Supper In The Jaws Of Chebu-Rasha
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'last-supper-in-the-jaws-of-chebu-rasha',
  'Last Supper In The Jaws Of Chebu-Rasha',
  'Тайная Вечеря В Пасти Чебу-Раши',
  'La Última Cena En Las Fauces De Chebu-Rasha',
  '切布拉莎下巴中的最后晚餐',
  'Digital print on paper. Biblical reference reimagined',
  'Цифровая печать на бумаге. Библейская отсылка переосмыслена',
  'Impresión digital en papel. Referencia bíblica reimaginada',
  '数字印刷在纸上。重新想象的圣经典故',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  14,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 15: Fire Breathing Chebu-Rasha
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
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
  15,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 16: Omniscient Or Eye
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'omniscient-or-eye',
  'Omniscient Or Eye',
  'Всевидящее Или Глаз',
  'Omnisciente O Ojo',
  '全知或眼睛',
  'Digital print on paper. All-seeing eye symbolism',
  'Цифровая печать на бумаге. Символика всевидящего ока',
  'Impresión digital en papel. Simbolismo del ojo que todo lo ve',
  '数字印刷在纸上。全视之眼的象征',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  16,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 17: Cherry
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'cherry',
  'Cherry',
  'Вишня',
  'Cereza',
  '樱桃',
  'Digital print on paper. Botanical study with surreal elements',
  'Цифровая печать на бумаге. Ботанический этюд с сюрреалистическими элементами',
  'Impresión digital en papel. Estudio botánico con elementos surrealistas',
  '数字印刷在纸上。带有超现实元素的植物研究',
  'Digital on Paper',
  '60 x 46.9 cm',
  2024,
  2453,
  'USD',
  0,
  1,
  1,
  17,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 18: Cube Legs
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'cube-legs',
  'Cube Legs',
  'Куб Ноги',
  'Cubo Piernas',
  '立方体腿',
  'Digital print on paper. Geometric deconstruction of human form',
  'Цифровая печать на бумаге. Геометрическая деконструкция человеческой формы',
  'Impresión digital en papel. Deconstrucción geométrica de la forma humana',
  '数字印刷在纸上。人体形态的几何解构',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  18,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 19: Yellow And Red Teeth Of Chebu-Rasha
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'yellow-and-red-teeth-of-chebu-rasha',
  'Yellow And Red Teeth Of Chebu-Rasha',
  'Желтые И Красные Зубы Чебу-Раши',
  'Dientes Amarillos Y Rojos De Chebu-Rasha',
  '切布拉莎的黄色和红色牙齿',
  'Screenprinting on paper. Bold color contrasts',
  'Шелкография на бумаге. Смелые цветовые контрасты',
  'Serigrafía en papel. Contrastes de colores audaces',
  '丝网印刷在纸上。大胆的色彩对比',
  'Screenprinting on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  19,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 20: Chebu-Rasha In Gloves
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'chebu-rasha-in-gloves',
  'Chebu-Rasha In Gloves',
  'Чебу-Раша В Перчатках',
  'Chebu-Rasha Con Guantes',
  '戴手套的切布拉莎',
  'Screenprinting on paper. Character study with accessories',
  'Шелкография на бумаге. Характерное исследование с аксессуарами',
  'Serigrafía en papel. Estudio de personaje con accesorios',
  '丝网印刷在纸上。带配饰的角色研究',
  'Screenprinting on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  20,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 21: Forest Of Pink Teeth Or Yellow Jaws Of Chebu-Rasha
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'forest-of-pink-teeth-or-yellow-jaws-of-chebu-rasha',
  'Forest Of Pink Teeth Or Yellow Jaws Of Chebu-Rasha',
  'Лес Розовых Зубов Или Желтые Челюсти Чебу-Раши',
  'Bosque De Dientes Rosas O Mandíbulas Amarillas De Chebu-Rasha',
  '粉红色牙齿之森或切布拉莎的黄色下巴',
  'Digital print on paper. Organic patterns and natural forms',
  'Цифровая печать на бумаге. Органические узоры и природные формы',
  'Impresión digital en papel. Patrones orgánicos y formas naturales',
  '数字印刷在纸上。有机图案和自然形态',
  'Digital on Paper',
  '40 x 40 cm',
  2024,
  1456,
  'USD',
  0,
  1,
  1,
  21,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 22: The Bull 4
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'the-bull-4',
  'The Bull 4',
  'Бык 4',
  'El Toro 4',
  '公牛4',
  'Screenprinting on paper. Fourth in bull transformation series',
  'Шелкография на бумаге. Четвертая работа серии трансформации быка',
  'Serigrafía en papel. Cuarta de la serie de transformación del toro',
  '丝网印刷在纸上。公牛变形系列第四部',
  'Screenprinting on Paper',
  '70 x 50 cm',
  2024,
  3089,
  'USD',
  1,
  1,
  1,
  22,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 23: The Bull 3
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'the-bull-3',
  'The Bull 3',
  'Бык 3',
  'El Toro 3',
  '公牛3',
  'Screenprinting on paper. Third in bull transformation series',
  'Шелкография на бумаге. Третья работа серии трансформации быка',
  'Serigrafía en papel. Tercera de la serie de transformación del toro',
  '丝网印刷在纸上。公牛变形系列第三部',
  'Screenprinting on Paper',
  '70 x 50 cm',
  2024,
  3089,
  'USD',
  0,
  1,
  1,
  23,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 24: The Bull 2
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'the-bull-2',
  'The Bull 2',
  'Бык 2',
  'El Toro 2',
  '公牛2',
  'Screenprinting on paper. Second in bull transformation series',
  'Шелкография на бумаге. Вторая работа серии трансформации быка',
  'Serigrafía en papel. Segunda de la serie de transformación del toro',
  '丝网印刷在纸上。公牛变形系列第二部',
  'Screenprinting on Paper',
  '70 x 50 cm',
  2024,
  3089,
  'USD',
  0,
  1,
  1,
  24,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 25: The Bull
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'the-bull',
  'The Bull',
  'Бык',
  'El Toro',
  '公牛',
  'Screenprinting on paper. First in bull transformation series',
  'Шелкография на бумаге. Первая работа серии трансформации быка',
  'Serigrafía en papel. Primera de la serie de transformación del toro',
  '丝网印刷在纸上。公牛变形系列第一部',
  'Screenprinting on Paper',
  '70 x 50 cm',
  2024,
  3089,
  'USD',
  0,
  1,
  1,
  25,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 26: Clubs
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'clubs',
  'Clubs',
  'Трефы',
  'Tréboles',
  '梅花',
  'Paper print. Playing card suit reimagined',
  'Принт на бумаге. Переосмысленная масть игральных карт',
  'Impresión en papel. Palo de naipes reimaginado',
  '纸质印刷。重新想象的扑克牌花色',
  'Paper',
  '37 x 46.5 cm',
  2024,
  993,
  'USD',
  0,
  1,
  1,
  26,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 27: Spades
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'spades',
  'Spades',
  'Пики',
  'Picas',
  '黑桃',
  'Screenprinting on paper. Playing card suit reimagined',
  'Шелкография на бумаге. Переосмысленная масть игральных карт',
  'Serigrafía en papel. Palo de naipes reimaginado',
  '丝网印刷在纸上。重新想象的扑克牌花色',
  'Screenprinting on Paper',
  '37 x 46.5 cm',
  2024,
  994,
  'USD',
  0,
  1,
  1,
  27,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 28: Malevich, Black Hand
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'malevich-black-hand',
  'Malevich, Black Hand',
  'Малевич, Черная Рука',
  'Malevich, Mano Negra',
  '马列维奇，黑手',
  'Paper print. Homage to suprematism founder',
  'Принт на бумаге. Дань основателю супрематизма',
  'Impresión en papel. Homenaje al fundador del suprematismo',
  '纸质印刷。向至上主义创始人致敬',
  'Paper',
  '55 x 44 cm',
  2024,
  829,
  'USD',
  0,
  1,
  1,
  28,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 29: Hand With Cherry
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'hand-with-cherry',
  'Hand With Cherry',
  'Рука С Вишней',
  'Mano Con Cereza',
  '拿着樱桃的手',
  'Paper print. Delicate gesture with fruit',
  'Принт на бумаге. Нежный жест с фруктом',
  'Impresión en papel. Gesto delicado con fruta',
  '纸质印刷。拿着水果的细腻手势',
  'Paper',
  '50 x 50 cm',
  2024,
  836,
  'USD',
  0,
  1,
  1,
  29,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 30: Squatting Lady, Princess Frog
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'squatting-lady-princess-frog',
  'Squatting Lady, Princess Frog',
  'Сидящая На Корточках Леди, Царевна Лягушка',
  'Dama En Cuclillas, Princesa Rana',
  '蹲着的女士，青蛙公主',
  'Paper print. Fairy tale reference',
  'Принт на бумаге. Отсылка к сказке',
  'Impresión en papel. Referencia a cuento de hadas',
  '纸质印刷。童话故事引用',
  'Paper',
  '50 x 50 cm',
  2024,
  836,
  'USD',
  0,
  1,
  1,
  30,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 31: White Head On Black
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'white-head-on-black',
  'White Head On Black',
  'Белая Голова На Черном',
  'Cabeza Blanca Sobre Negro',
  '黑底白头',
  'Screenprinting on paper. High contrast portrait',
  'Шелкография на бумаге. Высококонтрастный портрет',
  'Serigrafía en papel. Retrato de alto contraste',
  '丝网印刷在纸上。高对比度肖像',
  'Screenprinting on Paper',
  '30 x 40 cm',
  2024,
  620,
  'USD',
  0,
  1,
  1,
  31,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 32: Red Head On Blue
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'red-head-on-blue',
  'Red Head On Blue',
  'Красная Голова На Синем',
  'Cabeza Roja Sobre Azul',
  '蓝底红头',
  'Screenprinting on paper. Complementary color portrait',
  'Шелкография на бумаге. Портрет в дополняющих цветах',
  'Serigrafía en papel. Retrato de colores complementarios',
  '丝网印刷在纸上。互补色肖像',
  'Screenprinting on Paper',
  '30 x 40 cm',
  2024,
  620,
  'USD',
  0,
  1,
  1,
  32,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 33: Woman Faunus Or Woman On Hooves
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'woman-faunus-or-woman-on-hooves',
  'Woman Faunus Or Woman On Hooves',
  'Женщина Фавн Или Женщина На Копытах',
  'Mujer Fauno O Mujer Sobre Pezuñas',
  '女性半神或站在蹄子上的女人',
  'Bronze sculpture. Mythological transformation',
  'Бронзовая скульптура. Мифологическая трансформация',
  'Escultura de bronce. Transformación mitológica',
  '青铜雕塑。神话般的变形',
  'Bronze',
  '13 x 34 x 12 cm',
  2024,
  11408,
  'USD',
  0,
  1,
  1,
  33,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 34: Woman Buddha Or Woman As A Brush
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'woman-buddha-or-woman-as-a-brush',
  'Woman Buddha Or Woman As A Brush',
  'Женщина Будда Или Женщина Как Кисть',
  'Mujer Buda O Mujer Como Pincel',
  '佛陀女性或女人作为画笔',
  'Bronze sculpture. Spiritual and artistic fusion',
  'Бронзовая скульптура. Духовное и художественное слияние',
  'Escultura de bronce. Fusión espiritual y artística',
  '青铜雕塑。精神与艺术的融合',
  'Bronze',
  '13.4 x 27.5 x 8 cm',
  2024,
  11408,
  'USD',
  0,
  1,
  1,
  34,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 35: Mirror Mirror On The Wall Who's The Fairest Of Them All
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'mirror-mirror-on-the-wall-who-s-the-fairest-of-them-all',
  'Mirror Mirror On The Wall Who''s The Fairest Of Them All',
  'Свет Мой, Зеркальце, Скажи, Кто На Свете Всех Милее',
  'Espejito, Espejito, ¿Quién Es La Más Bella?',
  '魔镜魔镜告诉我，谁是世上最美的人',
  'Bronze sculpture. Fairy tale vanity explored',
  'Бронзовая скульптура. Исследование сказочного тщеславия',
  'Escultura de bronce. Vanidad de cuento de hadas explorada',
  '青铜雕塑。探索童话虚荣',
  'Bronze',
  '23 x 15 x 24.9 cm',
  2024,
  11428,
  'USD',
  0,
  1,
  1,
  35,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 36: Woman As A Table, Woman On A Bear Hide
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'woman-as-a-table-woman-on-a-bear-hide',
  'Woman As A Table, Woman On A Bear Hide',
  'Женщина Как Стол, Женщина На Медвежьей Шкуре',
  'Mujer Como Mesa, Mujer Sobre Piel De Oso',
  '女人作为桌子，熊皮上的女人',
  'Bronze sculpture. Object and subject merged',
  'Бронзовая скульптура. Слияние объекта и субъекта',
  'Escultura de bronce. Objeto y sujeto fusionados',
  '青铜雕塑。物体与主体的融合',
  'Bronze',
  '24 x 13.4 x 37.5 cm',
  2024,
  11458,
  'USD',
  0,
  1,
  1,
  36,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Product 37: The Reader Or The Princess And The Pea
INSERT INTO artworks (id, slug, title_en, title_ru, title_es, title_zh, 
  description_en, description_ru, description_es, description_zh,
  technique, dimensions, year, price, currency, 
  is_featured, available, is_visible, order_index, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'the-reader-or-the-princess-and-the-pea',
  'The Reader Or The Princess And The Pea',
  'Читательница Или Принцесса На Горошине',
  'La Lectora O La Princesa Y El Guisante',
  '读者或豌豆公主',
  'Digital photograph. Literary fairy tale reference',
  'Цифровая фотография. Отсылка к литературной сказке',
  'Fotografía digital. Referencia a cuento de hadas literario',
  '数字摄影。文学童话引用',
  'Digital on Other',
  '70 x 50 cm',
  2024,
  1548,
  'USD',
  0,
  1,
  1,
  37,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

COMMIT;

SELECT 'Imported ' || COUNT(*) || ' artworks' as result FROM artworks;
SELECT 'Featured artworks: ' || COUNT(*) as result FROM artworks WHERE is_featured = 1;
SELECT 'Available for sale: ' || COUNT(*) as result FROM artworks WHERE available = 1;
