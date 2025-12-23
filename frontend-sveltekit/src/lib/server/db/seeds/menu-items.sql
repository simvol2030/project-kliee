-- Menu Items Seed Data
-- Run this after fresh database creation

-- Clear existing menu items
DELETE FROM menu_items;

-- Insert menu items
INSERT INTO menu_items (href, label_en, label_ru, label_es, label_zh, order_index, is_visible) VALUES
('/gallery', 'Gallery', 'Галерея', 'Galería', '画廊', 1, 1),
('/about', 'About', 'О художнике', 'Sobre', '关于', 2, 1),
('/exhibitions', 'Exhibitions', 'Выставки', 'Exposiciones', '展览', 3, 1),
('/contact', 'Contact', 'Контакт', 'Contacto', '联系', 4, 1),
('/shop', 'Shop', 'Магазин', 'Tienda', '商店', 5, 1),
('/nft', 'NFT', 'NFT', 'NFT', 'NFT', 6, 1);

-- Verify
SELECT id, href, label_en, order_index FROM menu_items ORDER BY order_index;
