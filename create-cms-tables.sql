-- Create missing CMS tables for K-LIÉE

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    page_type TEXT DEFAULT 'static',
    template TEXT DEFAULT 'default',
    title_en TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    title_es TEXT NOT NULL,
    title_zh TEXT NOT NULL,
    content_en TEXT,
    content_ru TEXT,
    content_es TEXT,
    content_zh TEXT,
    seo_title_en TEXT,
    seo_title_ru TEXT,
    seo_title_es TEXT,
    seo_title_zh TEXT,
    seo_description_en TEXT,
    seo_description_ru TEXT,
    seo_description_es TEXT,
    seo_description_zh TEXT,
    featured_image_id INTEGER,
    is_published INTEGER DEFAULT 1,
    is_in_menu INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (featured_image_id) REFERENCES media(id)
);

-- Page Blocks table
CREATE TABLE IF NOT EXISTS page_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL,
    block_type TEXT NOT NULL,
    content TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

-- Exhibition Artworks junction table
CREATE TABLE IF NOT EXISTS exhibition_artworks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exhibition_id TEXT NOT NULL,
    artwork_id TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE,
    FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
    UNIQUE(exhibition_id, artwork_id)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    type TEXT DEFAULT 'string',
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Footer Brand
CREATE TABLE IF NOT EXISTS footer_brand (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_en TEXT,
    name_ru TEXT,
    name_es TEXT,
    name_zh TEXT,
    tagline_en TEXT,
    tagline_ru TEXT,
    tagline_es TEXT,
    tagline_zh TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Footer Social Links
CREATE TABLE IF NOT EXISTS footer_social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    icon TEXT,
    url TEXT NOT NULL,
    label_en TEXT,
    label_ru TEXT,
    label_es TEXT,
    label_zh TEXT,
    order_index INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1
);

-- Footer Contact
CREATE TABLE IF NOT EXISTS footer_contact (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    phone TEXT,
    address_en TEXT,
    address_ru TEXT,
    address_es TEXT,
    address_zh TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Homepage Hero
CREATE TABLE IF NOT EXISTS homepage_hero (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    is_active INTEGER DEFAULT 1,
    transition_type TEXT DEFAULT 'fade',
    auto_play INTEGER DEFAULT 1,
    interval INTEGER DEFAULT 5000,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Hero Slides
CREATE TABLE IF NOT EXISTS hero_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hero_id INTEGER,
    title_en TEXT,
    title_ru TEXT,
    title_es TEXT,
    title_zh TEXT,
    subtitle_en TEXT,
    subtitle_ru TEXT,
    subtitle_es TEXT,
    subtitle_zh TEXT,
    cta_text_en TEXT,
    cta_text_ru TEXT,
    cta_text_es TEXT,
    cta_text_zh TEXT,
    cta_url TEXT,
    background_image_id INTEGER,
    order_index INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1,
    FOREIGN KEY (hero_id) REFERENCES homepage_hero(id) ON DELETE CASCADE,
    FOREIGN KEY (background_image_id) REFERENCES media(id)
);

-- Homepage Sections
CREATE TABLE IF NOT EXISTS homepage_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_type TEXT NOT NULL,
    is_visible INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    settings TEXT
);

-- Homepage About
CREATE TABLE IF NOT EXISTS homepage_about (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_en TEXT,
    title_ru TEXT,
    title_es TEXT,
    title_zh TEXT,
    content_en TEXT,
    content_ru TEXT,
    content_es TEXT,
    content_zh TEXT,
    image_id INTEGER,
    cta_text_en TEXT,
    cta_text_ru TEXT,
    cta_text_es TEXT,
    cta_text_zh TEXT,
    cta_url TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES media(id)
);

-- Homepage News
CREATE TABLE IF NOT EXISTS homepage_news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_en TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    title_es TEXT NOT NULL,
    title_zh TEXT NOT NULL,
    excerpt_en TEXT,
    excerpt_ru TEXT,
    excerpt_es TEXT,
    excerpt_zh TEXT,
    image_id INTEGER,
    link_url TEXT,
    published_date TEXT,
    is_visible INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (image_id) REFERENCES media(id)
);

-- Homepage Testimonials
CREATE TABLE IF NOT EXISTS homepage_testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_name TEXT NOT NULL,
    role_en TEXT,
    role_ru TEXT,
    role_es TEXT,
    role_zh TEXT,
    content_en TEXT NOT NULL,
    content_ru TEXT NOT NULL,
    content_es TEXT NOT NULL,
    content_zh TEXT NOT NULL,
    avatar_id INTEGER,
    rating INTEGER DEFAULT 5,
    is_visible INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (avatar_id) REFERENCES media(id)
);

-- Homepage Process
CREATE TABLE IF NOT EXISTS homepage_process (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    step_number INTEGER NOT NULL,
    title_en TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    title_es TEXT NOT NULL,
    title_zh TEXT NOT NULL,
    description_en TEXT,
    description_ru TEXT,
    description_es TEXT,
    description_zh TEXT,
    icon TEXT,
    order_index INTEGER DEFAULT 0
);

-- Works Page
CREATE TABLE IF NOT EXISTS works_page (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_en TEXT,
    title_ru TEXT,
    title_es TEXT,
    title_zh TEXT,
    intro_en TEXT,
    intro_ru TEXT,
    intro_es TEXT,
    intro_zh TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert default data
INSERT OR IGNORE INTO footer_brand (id, name_en, name_ru, name_es, name_zh, tagline_en, tagline_ru, tagline_es, tagline_zh)
VALUES (1, 'Svetlana K-Liée', 'Светлана К-Лие', 'Svetlana K-Liée', '斯维特拉娜·K-利埃', 
        'Contemporary Artist', 'Современный художник', 'Artista Contemporánea', '当代艺术家');

INSERT OR IGNORE INTO footer_contact (id, email)
VALUES (1, 'info@k-lie.com');

INSERT OR IGNORE INTO homepage_hero (id, is_active)
VALUES (1, 1);

