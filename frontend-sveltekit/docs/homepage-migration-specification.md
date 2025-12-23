# Homepage Migration Specification
## K-LIÉE Artist Portfolio - SvelteKit 5 Implementation

**Version:** 1.0
**Date:** 2025-11-09
**Status:** Ready for Implementation

---

## 📋 Executive Summary

### Purpose
Migrate the homepage from static HTML to a modern SvelteKit 5 application with enhanced UX, dark theme support, and multilingual capabilities.

### Complexity Assessment
**Moderate to High**
- 8 distinct sections
- Complex animations and interactions
- Image-heavy content (hero slider, galleries)
- Responsive design across 3 breakpoints
- 4 language support

### Key Improvements Over Original
1. **Modern UX**: Smooth page transitions, intersection observers, progressive image loading
2. **Dark Theme**: Full dark mode support with proper contrast
3. **Performance**: WebP images, lazy loading, code splitting
4. **Accessibility**: WCAG AA compliance, semantic HTML, keyboard navigation
5. **Type Safety**: Full TypeScript coverage with strict interfaces
6. **Apple-Minimalist Aesthetic**: Clean, spacious, elegant design

### Development Estimate
**40-50 hours** (including testing and optimization)

---

## 🎨 Section-by-Section Breakdown

### 1. Hero Section
**Location:** Top of page
**Purpose:** Dramatic first impression with rotating artwork images and key artist statement

#### Visual Design
- **Desktop (1920px):** Full viewport height, large centered text over image slider
- **Tablet (768px):** Reduced text size, maintained full-height layout
- **Mobile (375px):** Stack content, reduce image height to 60vh

#### Data Requirements
```typescript
interface HeroSection {
  slides: HeroSlide[];
  title: TranslatedString;
  subtitle: TranslatedString;
  quote: TranslatedString;
  announcement?: {
    highlight: TranslatedString;
    text: TranslatedString;
    link?: string;
  };
}

interface HeroSlide {
  image: string; // Path relative to /images/
  alt: TranslatedString;
  duration?: number; // milliseconds, default 4000
}

interface TranslatedString {
  en: string;
  ru: string;
  es: string;
  zh: string;
}
```

#### Images Used
- `/images/home/_MG_3235.jpg`
- `/images/works/chebu-rasha/stormcloudpussycomb.jpg`
- `/images/works/porcelain/omniscient.jpg`

#### Interactions
- **Auto-rotating slider**: 4s per slide, fade transitions
- **Pause on hover**: Stop rotation when user hovers
- **Slide indicators**: Optional dots at bottom for manual navigation
- **Parallax effect**: Subtle background movement on scroll (optional enhancement)

#### Responsive Behavior
| Breakpoint | Title Size | Quote Size | Image Height |
|------------|------------|------------|--------------|
| Desktop    | 120px      | 22px       | 100vh        |
| Tablet     | 80px       | 20px       | 100vh        |
| Mobile     | 48px       | 18px       | 60vh         |

#### Dark Theme Adaptations
- Overlay gradient: Darker (rgba(0,0,0,0.8) → rgba(0,0,0,0.5))
- Text shadows for better readability
- Gold accent: #ffd700 (brighter in dark mode)
- Red highlight: Softer red (#ff6b6b instead of #dc143c)

---

### 2. Featured Collections Section
**Location:** After hero
**Purpose:** Showcase 6 main artwork series with hover-reveal info

#### Visual Design
- **Desktop:** 3-column grid (repeat(auto-fit, minmax(350px, 1fr)))
- **Tablet:** 2-column grid
- **Mobile:** 1-column stack

#### Data Structure
```typescript
interface FeaturedCollectionsSection {
  title: TranslatedString;
  subtitle: TranslatedString;
  collections: WorkCollection[];
}

interface WorkCollection {
  id: string; // URL slug (e.g., "chebu-rasha")
  title: TranslatedString;
  description: TranslatedString;
  coverImage: string;
  link: string; // e.g., "/works/chebu-rasha"
}
```

#### Collections Data
1. **CHEBU-RASHA** - Soviet nostalgia meets contemporary art
2. **PORCELAIN** - Delicate forms, powerful messages
3. **THE BULL** - Strength and vulnerability intertwined
4. **THE LAST SUPPER** - Reimagining classical narratives
5. **SCULPTURES** - Three-dimensional poetry
6. **HOTEL SERIES** - Transient spaces, permanent impressions

#### Interactions
- **Hover effect**: Image scales to 1.1, opacity 0.8
- **Info reveal**: Slide up from bottom with gradient overlay
- **Click target**: Entire card is clickable (a tag wrapper)
- **Focus state**: Visible outline for keyboard navigation

#### Image Optimization
- **Format:** WebP with JPG fallback
- **Dimensions:** 700x1000px (2:3 ratio)
- **Lazy loading:** Intersection Observer API
- **Blur placeholder:** Low-quality image placeholder (LQIP)

#### Component Reusability
**NEW Component Required:** `FeaturedWorks.svelte`
- Accepts `collections` prop
- Handles grid layout and responsive behavior
- Self-contained hover animations

**Potential Reuse:** This component can be reused on Works overview page

---

### 3. Current Exhibitions Section
**Location:** After featured works
**Purpose:** Highlight ongoing/upcoming exhibitions

#### Visual Design
- **Desktop:** 2-column layout (featured exhibition + placeholder card)
- **Tablet:** 2-column maintained
- **Mobile:** Stack vertically

#### Data Structure
```typescript
interface ExhibitionsSection {
  title: TranslatedString;
  subtitle: TranslatedString;
  featured?: Exhibition;
  viewAllLink: string;
}

interface Exhibition {
  id: string;
  title: TranslatedString;
  description: TranslatedString;
  location: TranslatedString;
  workCount: number;
  dateRange: {
    start: string; // ISO date
    end?: string; // ISO date or null for "Ongoing"
  };
  status: 'current' | 'upcoming' | 'past';
  coverImage: string;
  link: string;
}
```

#### Interactive Elements
- **Badge:** "CURRENT" badge in red (#dc143c)
- **Image hover:** Scale to 1.05
- **Button hover:** Background/border color swap
- **Placeholder card:** "Coming Soon" message with outline button

#### Component Specification
**NEW Component:** `ExhibitionCard.svelte`
```typescript
interface ExhibitionCardProps {
  exhibition: Exhibition;
  featured?: boolean; // Show badge if true
}
```

**Reusability:** Use on Exhibitions page for listing all exhibitions

---

### 4. About Preview Section
**Location:** After exhibitions
**Purpose:** Brief introduction to the artist with CTA to full bio

#### Visual Design
- **Desktop:** 2-column layout (text left, image right)
- **Tablet:** 2-column maintained, smaller spacing
- **Mobile:** Stack (text → image)

#### Data Structure
```typescript
interface AboutSection {
  title: TranslatedString;
  paragraphs: TranslatedString[];
  ctaText: TranslatedString;
  ctaLink: string;
  image: string;
  imageAlt: TranslatedString;
}
```

#### Content
- **Title:** "About the Artist"
- **Paragraph 1:** Svetlana K-Liée background (Russian-born, England since 2006)
- **Paragraph 2:** Techniques and recognition (bronze, ceramics, Hermitage, Saatchi)
- **CTA:** "Learn More" button → `/about`
- **Image:** `/images/about/ELT_5672.jpg`

#### Styling Notes
- **Background:** Light gray (#f5f5f5) in light theme, dark gray (#1a1a1a) in dark
- **Image height:** Fixed 600px on desktop, auto on mobile
- **Text color:** #555 (light), #aaa (dark)
- **Button:** Black background, white text, hover inverts

#### Component Reusability
**Reuse Existing?** Check if generic `ContentWithImage.svelte` exists
**If Not, Create:** `AboutPreview.svelte` (page-specific)

---

### 5. Latest News Section
**Location:** After about
**Purpose:** Showcase recent exhibitions, launches, events

#### Visual Design
- **Desktop:** 3-column grid
- **Tablet:** 2-column grid
- **Mobile:** 1-column stack

#### Data Structure
```typescript
interface NewsSection {
  title: TranslatedString;
  items: NewsItem[];
}

interface NewsItem {
  id: string;
  date: string; // Display format: "December 2024"
  title: TranslatedString;
  excerpt: TranslatedString;
  link?: string; // Optional link to full article
}
```

#### Sample Data
1. **December 2024** - Shanghai History Museum Exhibition
2. **November 2024** - New Porcelain Collection Launch
3. **October 2024** - Seattle Art Fair Success

#### Interactive Elements
- **Card hover:** Lift up (-5px translateY), enhanced shadow
- **Link hover:** Gold color (#d4af37)
- **Date badge:** Gold color, uppercase, letter-spacing

#### Component Specification
**NEW Component:** `NewsGrid.svelte`
```typescript
interface NewsGridProps {
  items: NewsItem[];
  columns?: number; // Default 3
}
```

**Reusability:** Can be used on News/Blog page

---

### 6. Testimonials Section
**Location:** After news
**Purpose:** Social proof from critics and collectors

#### Visual Design
- **Desktop:** 3-column grid
- **Tablet:** 2-column grid
- **Mobile:** 1-column stack

#### Data Structure
```typescript
interface TestimonialsSection {
  title: TranslatedString;
  testimonials: Testimonial[];
}

interface Testimonial {
  id: string;
  quote: TranslatedString;
  author: {
    name: string; // Not translated (proper names)
    title: TranslatedString;
  };
}
```

#### Styling Notes
- **Background:** Black (#000) in light theme, dark gray (#111) in dark
- **Text color:** White with 90% opacity for quotes
- **Author name:** Gold (#d4af37)
- **Author title:** White with 60% opacity

#### Sample Testimonials
1. Marina Abramović - Performance Artist
2. Charles Saatchi - Art Collector
3. Hans Ulrich Obrist - Curator, Serpentine Galleries

#### Component Specification
**NEW Component:** `TestimonialGrid.svelte`
```typescript
interface TestimonialGridProps {
  testimonials: Testimonial[];
  darkBackground?: boolean; // Default true
}
```

---

### 7. Creative Process Section
**Location:** After testimonials
**Purpose:** Visual storytelling of artistic process

#### Visual Design
- **Desktop:** 3-column grid
- **Tablet:** 2-column grid (3rd item wraps)
- **Mobile:** 1-column stack

#### Data Structure
```typescript
interface ProcessSection {
  title: TranslatedString;
  steps: ProcessStep[];
}

interface ProcessStep {
  id: string;
  title: TranslatedString;
  description: TranslatedString;
  image: string;
}
```

#### Sample Steps
1. **Conceptualization** - Cultural symbols and personal mythology
2. **Material Exploration** - Bronze, ceramics, mixed media
3. **Transformation** - Layers of meaning and technique

#### Images
- `/images/works/sculptures/source_sc_4_klie_han.jpg`
- `/images/works/porcelain/_DSC1039.jpg`
- `/images/works/hotel-series/IMG_5206.jpg`

#### Component Specification
**NEW Component:** `ProcessGrid.svelte`
```typescript
interface ProcessGridProps {
  steps: ProcessStep[];
}
```

---

## 🧩 Component Hierarchy

```
+page.svelte
├── <svelte:head> (SEO metadata)
├── Hero.svelte ✨ NEW
│   ├── HeroSlider.svelte ✨ NEW (optional sub-component)
│   └── HeroContent.svelte ✨ NEW (optional sub-component)
├── FeaturedWorks.svelte ✨ NEW
│   └── WorkCard.svelte ✨ NEW
├── ExhibitionsPreview.svelte ✨ NEW
│   ├── ExhibitionCard.svelte ✨ NEW
│   └── ComingSoonCard.svelte ✨ NEW
├── AboutPreview.svelte ✨ NEW
├── NewsGrid.svelte ✨ NEW
│   └── NewsCard.svelte ✨ NEW
├── TestimonialGrid.svelte ✨ NEW
│   └── TestimonialCard.svelte ✨ NEW
└── ProcessGrid.svelte ✨ NEW
    └── ProcessStep.svelte ✨ NEW
```

**Existing Components (Reused):**
- Header (from layout)
- Footer (from layout)
- LanguageSwitcher (from layout)
- MobileMenu (from layout)

**Total NEW Components:** 14 components

---

## 📦 Data Structure: homepage.json

### File Location
`/mnt/c/dev/project-kliee/project-box-v3-orm/data/homepage.json`

### Complete Structure
```json
{
  "pageType": "homepage",
  "meta": {
    "title": {
      "en": "K-LIÉE - Contemporary Artist",
      "ru": "К-ЛИЕ - Современный художник",
      "es": "K-LIÉE - Artista Contemporánea",
      "zh": "K-LIÉE - 当代艺术家"
    },
    "description": {
      "en": "Svetlana K-Liée, Russian-born contemporary artist based in England. Explore bronze sculptures, ceramic works, and thought-provoking installations.",
      "ru": "Светлана К-Лие, российский современный художник, живущая в Англии. Изучайте бронзовые скульптуры, керамические работы и провокационные инсталляции.",
      "es": "Svetlana K-Liée, artista contemporánea rusa radicada en Inglaterra. Explora esculturas de bronce, obras cerámicas e instalaciones provocativas.",
      "zh": "俄罗斯出生的当代艺术家Svetlana K-Liée，现居英国。探索青铜雕塑、陶瓷作品和发人深省的装置艺术。"
    },
    "keywords": {
      "en": "contemporary art, bronze sculpture, ceramic art, Russian artist, K-LIÉE",
      "ru": "современное искусство, бронзовая скульптура, керамическое искусство, русский художник, К-Лие",
      "es": "arte contemporáneo, escultura en bronce, arte cerámico, artista rusa, K-LIÉE",
      "zh": "当代艺术, 青铜雕塑, 陶瓷艺术, 俄罗斯艺术家, K-LIÉE"
    }
  },
  "sections": {
    "hero": {
      "slides": [
        {
          "image": "/images/home/_MG_3235.jpg",
          "alt": {
            "en": "K-LIÉE Art Studio",
            "ru": "Студия К-Лие",
            "es": "Estudio de arte K-LIÉE",
            "zh": "K-LIÉE 艺术工作室"
          }
        },
        {
          "image": "/images/works/chebu-rasha/stormcloudpussycomb.jpg",
          "alt": {
            "en": "CHEBU-RASHA Series",
            "ru": "Серия ЧЕБУ-РАША",
            "es": "Serie CHEBU-RASHA",
            "zh": "CHEBU-RASHA 系列"
          }
        },
        {
          "image": "/images/works/porcelain/omniscient.jpg",
          "alt": {
            "en": "Porcelain Work",
            "ru": "Фарфоровая работа",
            "es": "Obra de porcelana",
            "zh": "瓷器作品"
          }
        }
      ],
      "title": {
        "en": "K-LIÉE",
        "ru": "К-ЛИЕ",
        "es": "K-LIÉE",
        "zh": "K-LIÉE"
      },
      "subtitle": {
        "en": "International Artist",
        "ru": "Международный художник",
        "es": "Artista Internacional",
        "zh": "国际艺术家"
      },
      "quote": {
        "en": "I am the Artist - This is my Vision",
        "ru": "Я художник - Это мое видение",
        "es": "Soy la Artista - Esta es mi Visión",
        "zh": "我是艺术家 - 这是我的愿景"
      },
      "announcement": {
        "highlight": {
          "en": "Most Recent Auction Sale!",
          "ru": "Последняя продажа на аукционе!",
          "es": "¡Venta de subasta más reciente!",
          "zh": "最新拍卖销售！"
        },
        "text": {
          "en": "'Malevich, Black Hand' sold at Bonhams London for £640",
          "ru": "'Малевич, Черная рука' продана на Bonhams London за £640",
          "es": "'Malevich, Black Hand' vendida en Bonhams London por £640",
          "zh": "'马列维奇，黑手' 在伦敦邦瀚斯拍卖行以£640售出"
        }
      }
    },
    "featuredCollections": {
      "title": {
        "en": "Featured Collections",
        "ru": "Избранные коллекции",
        "es": "Colecciones Destacadas",
        "zh": "精选系列"
      },
      "subtitle": {
        "en": "Exploring the boundaries between soul and body, cosmos and consciousness",
        "ru": "Исследование границ между душой и телом, космосом и сознанием",
        "es": "Explorando los límites entre alma y cuerpo, cosmos y conciencia",
        "zh": "探索灵魂与身体、宇宙与意识之间的界限"
      },
      "collections": [
        {
          "id": "chebu-rasha",
          "title": {
            "en": "CHEBU-RASHA",
            "ru": "ЧЕБУ-РАША",
            "es": "CHEBU-RASHA",
            "zh": "切布拉沙"
          },
          "description": {
            "en": "Soviet nostalgia meets contemporary art",
            "ru": "Советская ностальгия встречается с современным искусством",
            "es": "La nostalgia soviética se encuentra con el arte contemporáneo",
            "zh": "苏联怀旧与当代艺术的融合"
          },
          "coverImage": "/images/works/chebu-rasha/cheburasha.jpg",
          "link": "/works/chebu-rasha"
        },
        {
          "id": "porcelain",
          "title": {
            "en": "PORCELAIN",
            "ru": "ФАРФОР",
            "es": "PORCELANA",
            "zh": "瓷器"
          },
          "description": {
            "en": "Delicate forms, powerful messages",
            "ru": "Нежные формы, мощные послания",
            "es": "Formas delicadas, mensajes poderosos",
            "zh": "精致的形式，强有力的信息"
          },
          "coverImage": "/images/works/porcelain/omniscient.jpg",
          "link": "/works/porcelain"
        },
        {
          "id": "the-bull",
          "title": {
            "en": "THE BULL",
            "ru": "БЫК",
            "es": "EL TORO",
            "zh": "公牛"
          },
          "description": {
            "en": "Strength and vulnerability intertwined",
            "ru": "Сила и уязвимость переплетены",
            "es": "Fuerza y vulnerabilidad entrelazadas",
            "zh": "力量与脆弱交织"
          },
          "coverImage": "/images/works/the-bull/bull4.png",
          "link": "/works/the-bull"
        },
        {
          "id": "last-supper",
          "title": {
            "en": "THE LAST SUPPER",
            "ru": "ТАЙНАЯ ВЕЧЕРЯ",
            "es": "LA ÚLTIMA CENA",
            "zh": "最后的晚餐"
          },
          "description": {
            "en": "Reimagining classical narratives",
            "ru": "Переосмысление классических нарративов",
            "es": "Reimaginando narrativas clásicas",
            "zh": "重新诠释经典叙事"
          },
          "coverImage": "/images/works/last-supper/5_2.jpg",
          "link": "/works/last-supper"
        },
        {
          "id": "sculptures",
          "title": {
            "en": "SCULPTURES",
            "ru": "СКУЛЬПТУРЫ",
            "es": "ESCULTURAS",
            "zh": "雕塑"
          },
          "description": {
            "en": "Three-dimensional poetry",
            "ru": "Трехмерная поэзия",
            "es": "Poesía tridimensional",
            "zh": "三维诗歌"
          },
          "coverImage": "/images/works/sculptures/K-Lie_Feathers.jpg",
          "link": "/works/sculptures"
        },
        {
          "id": "hotel-series",
          "title": {
            "en": "HOTEL SERIES",
            "ru": "ОТЕЛЬНАЯ СЕРИЯ",
            "es": "SERIE HOTEL",
            "zh": "酒店系列"
          },
          "description": {
            "en": "Transient spaces, permanent impressions",
            "ru": "Временные пространства, постоянные впечатления",
            "es": "Espacios transitorios, impresiones permanentes",
            "zh": "短暂的空间，永久的印象"
          },
          "coverImage": "/images/works/hotel-series/IMG_5206.jpg",
          "link": "/works/hotel-series"
        }
      ]
    },
    "exhibitions": {
      "title": {
        "en": "Current Exhibitions",
        "ru": "Текущие выставки",
        "es": "Exposiciones Actuales",
        "zh": "当前展览"
      },
      "subtitle": {
        "en": "Curated presentations of contemporary works in dialogue with space and concept",
        "ru": "Кураторские презентации современных работ в диалоге с пространством и концепцией",
        "es": "Presentaciones curadas de obras contemporáneas en diálogo con el espacio y el concepto",
        "zh": "与空间和概念对话的当代作品策展"
      },
      "featured": {
        "id": "divot-2025",
        "title": {
          "en": "Divot Exhibition 2025",
          "ru": "Выставка Divot 2025",
          "es": "Exposición Divot 2025",
          "zh": "Divot 2025展览"
        },
        "description": {
          "en": "A provocative dialogue between art and gastronomy featuring 14 contemporary works exploring the boundaries between flesh, soul, and artistic expression.",
          "ru": "Провокационный диалог между искусством и гастрономией, включающий 14 современных работ, исследующих границы между плотью, душой и художественным выражением.",
          "es": "Un diálogo provocativo entre arte y gastronomía con 14 obras contemporáneas que exploran los límites entre la carne, el alma y la expresión artística.",
          "zh": "艺术与美食之间的挑衅性对话，展出14件当代作品，探索肉体、灵魂和艺术表达之间的界限。"
        },
        "location": {
          "en": "Divot Restaurant",
          "ru": "Ресторан Divot",
          "es": "Restaurante Divot",
          "zh": "Divot餐厅"
        },
        "workCount": 14,
        "dateRange": {
          "start": "2025-08-01",
          "end": null
        },
        "status": "current",
        "coverImage": "/images/exhibitions/divot-2025/work-5/IMG_6152.jpg",
        "link": "/exhibitions/divot-2025"
      },
      "viewAllLink": "/exhibitions"
    },
    "about": {
      "title": {
        "en": "About the Artist",
        "ru": "О художнике",
        "es": "Sobre la Artista",
        "zh": "关于艺术家"
      },
      "paragraphs": [
        {
          "en": "Svetlana K-Liée, a Russian-born artist residing in England since 2006, is proficient in various techniques including bronze, ceramics, etching, printmaking, and photography.",
          "ru": "Светлана К-Лие, художник российского происхождения, проживающая в Англии с 2006 года, владеет различными техниками, включая бронзу, керамику, офорт, гравюру и фотографию.",
          "es": "Svetlana K-Liée, artista nacida en Rusia que reside en Inglaterra desde 2006, domina varias técnicas como bronce, cerámica, grabado, litografía y fotografía.",
          "zh": "Svetlana K-Liée，俄罗斯出生的艺术家，自2006年起居住在英格兰，精通多种技术，包括青铜、陶瓷、蚀刻、版画和摄影。"
        },
        {
          "en": "Her artwork has achieved international recognition, with exhibitions in renowned venues such as the Hermitage and Saatchi Galleries.",
          "ru": "Ее работы получили международное признание, выставки проходили в таких известных местах, как Эрмитаж и галереи Саатчи.",
          "es": "Su obra ha alcanzado reconocimiento internacional, con exposiciones en lugares prestigiosos como el Hermitage y las Galerías Saatchi.",
          "zh": "她的作品获得了国际认可，在埃尔米塔日和萨奇画廊等著名场所举办展览。"
        }
      ],
      "ctaText": {
        "en": "Learn More",
        "ru": "Узнать больше",
        "es": "Saber más",
        "zh": "了解更多"
      },
      "ctaLink": "/about",
      "image": "/images/about/ELT_5672.jpg",
      "imageAlt": {
        "en": "Svetlana K-Liée in studio",
        "ru": "Светлана К-Лие в студии",
        "es": "Svetlana K-Liée en el estudio",
        "zh": "Svetlana K-Liée在工作室"
      }
    },
    "news": {
      "title": {
        "en": "Latest News & Exhibitions",
        "ru": "Последние новости и выставки",
        "es": "Últimas Noticias y Exposiciones",
        "zh": "最新消息与展览"
      },
      "items": [
        {
          "id": "shanghai-dec-2024",
          "date": "December 2024",
          "title": {
            "en": "Shanghai History Museum Exhibition",
            "ru": "Выставка в Шанхайском историческом музее",
            "es": "Exposición en el Museo de Historia de Shanghái",
            "zh": "上海历史博物馆展览"
          },
          "excerpt": {
            "en": "K-LIÉE's works featured in 'Lev Tolstoy' exhibition showcasing contemporary interpretations of classical Russian literature.",
            "ru": "Работы К-Лие представлены на выставке 'Лев Толстой', демонстрирующей современные интерпретации классической русской литературы.",
            "es": "Las obras de K-LIÉE aparecen en la exposición 'Lev Tolstoy', que muestra interpretaciones contemporáneas de la literatura rusa clásica.",
            "zh": "K-LIÉE的作品在'列夫·托尔斯泰'展览中亮相，展示了对经典俄罗斯文学的当代诠释。"
          },
          "link": null
        },
        {
          "id": "porcelain-nov-2024",
          "date": "November 2024",
          "title": {
            "en": "New Porcelain Collection Launch",
            "ru": "Запуск новой коллекции фарфора",
            "es": "Lanzamiento de nueva colección de porcelana",
            "zh": "新瓷器系列发布"
          },
          "excerpt": {
            "en": "Unveiling the latest series exploring the fragility of human existence through delicate ceramic forms.",
            "ru": "Представляем последнюю серию, исследующую хрупкость человеческого существования через изящные керамические формы.",
            "es": "Presentación de la última serie que explora la fragilidad de la existencia humana a través de delicadas formas cerámicas.",
            "zh": "通过精致的陶瓷形式探索人类存在的脆弱性的最新系列揭幕。"
          },
          "link": null
        },
        {
          "id": "seattle-oct-2024",
          "date": "October 2024",
          "title": {
            "en": "Seattle Art Fair Success",
            "ru": "Успех на арт-ярмарке в Сиэтле",
            "es": "Éxito en la Feria de Arte de Seattle",
            "zh": "西雅图艺术博览会成功"
          },
          "excerpt": {
            "en": "Overwhelming response at Seattle Art Fair with Jade Flower Gallery, multiple pieces acquired by collectors.",
            "ru": "Ошеломляющий отклик на арт-ярмарке в Сиэтле с галереей Jade Flower, несколько работ приобретены коллекционерами.",
            "es": "Respuesta abrumadora en la Feria de Arte de Seattle con Jade Flower Gallery, múltiples piezas adquiridas por coleccionistas.",
            "zh": "在西雅图艺术博览会上与Jade Flower画廊获得热烈反响，多件作品被收藏家收购。"
          },
          "link": null
        }
      ]
    },
    "testimonials": {
      "title": {
        "en": "Critics & Collectors",
        "ru": "Критики и коллекционеры",
        "es": "Críticos y Coleccionistas",
        "zh": "评论家与收藏家"
      },
      "testimonials": [
        {
          "id": "marina-abramovic",
          "quote": {
            "en": "K-LIÉE's work transcends traditional boundaries, creating a dialogue between the ancient and contemporary that is both profound and accessible.",
            "ru": "Работа К-Лие выходит за традиционные границы, создавая диалог между древним и современным, который одновременно глубок и доступен.",
            "es": "El trabajo de K-LIÉE trasciende los límites tradicionales, creando un diálogo entre lo antiguo y lo contemporáneo que es profundo y accesible.",
            "zh": "K-LIÉE的作品超越了传统界限，在古代与当代之间建立了既深刻又易于理解的对话。"
          },
          "author": {
            "name": "Marina Abramović",
            "title": {
              "en": "Performance Artist",
              "ru": "Художник перформанса",
              "es": "Artista de Performance",
              "zh": "行为艺术家"
            }
          }
        },
        {
          "id": "charles-saatchi",
          "quote": {
            "en": "The CHEBU-RASHA series is a masterful exploration of cultural memory and transformation. Each piece resonates with both nostalgia and radical reimagining.",
            "ru": "Серия ЧЕБУ-РАША - это мастерское исследование культурной памяти и трансформации. Каждая работа резонирует как с ностальгией, так и с радикальным переосмыслением.",
            "es": "La serie CHEBU-RASHA es una exploración magistral de la memoria cultural y la transformación. Cada pieza resuena con nostalgia y reimaginación radical.",
            "zh": "CHEBU-RASHA系列是对文化记忆和转型的精湛探索。每件作品都同时体现了怀旧和激进的重新想象。"
          },
          "author": {
            "name": "Charles Saatchi",
            "title": {
              "en": "Art Collector",
              "ru": "Коллекционер искусства",
              "es": "Coleccionista de Arte",
              "zh": "艺术收藏家"
            }
          }
        },
        {
          "id": "hans-ulrich-obrist",
          "quote": {
            "en": "Her porcelain works achieve a rare balance between fragility and strength, beauty and the grotesque. Truly contemporary in spirit.",
            "ru": "Ее фарфоровые работы достигают редкого баланса между хрупкостью и силой, красотой и гротеском. Поистине современные по духу.",
            "es": "Sus obras de porcelana logran un equilibrio raro entre fragilidad y fuerza, belleza y lo grotesco. Verdaderamente contemporáneas en espíritu.",
            "zh": "她的瓷器作品在脆弱与力量、美丽与怪诞之间实现了罕见的平衡。真正具有当代精神。"
          },
          "author": {
            "name": "Hans Ulrich Obrist",
            "title": {
              "en": "Curator, Serpentine Galleries",
              "ru": "Куратор, галереи Serpentine",
              "es": "Curador, Galerías Serpentine",
              "zh": "策展人，蛇形画廊"
            }
          }
        }
      ]
    },
    "process": {
      "title": {
        "en": "Creative Process",
        "ru": "Творческий процесс",
        "es": "Proceso Creativo",
        "zh": "创作过程"
      },
      "steps": [
        {
          "id": "conceptualization",
          "title": {
            "en": "Conceptualization",
            "ru": "Концептуализация",
            "es": "Conceptualización",
            "zh": "概念化"
          },
          "description": {
            "en": "Each series begins with deep exploration of cultural symbols and personal mythology",
            "ru": "Каждая серия начинается с глубокого исследования культурных символов и личной мифологии",
            "es": "Cada serie comienza con una exploración profunda de símbolos culturales y mitología personal",
            "zh": "每个系列都始于对文化符号和个人神话的深入探索"
          },
          "image": "/images/works/sculptures/source_sc_4_klie_han.jpg"
        },
        {
          "id": "material-exploration",
          "title": {
            "en": "Material Exploration",
            "ru": "Исследование материалов",
            "es": "Exploración de Materiales",
            "zh": "材料探索"
          },
          "description": {
            "en": "Working with bronze, ceramics, and mixed media to find the perfect expression",
            "ru": "Работа с бронзой, керамикой и смешанными техниками для поиска идеального выражения",
            "es": "Trabajando con bronce, cerámica y técnicas mixtas para encontrar la expresión perfecta",
            "zh": "使用青铜、陶瓷和混合媒介寻找完美的表达"
          },
          "image": "/images/works/porcelain/_DSC1039.jpg"
        },
        {
          "id": "transformation",
          "title": {
            "en": "Transformation",
            "ru": "Трансформация",
            "es": "Transformación",
            "zh": "转化"
          },
          "description": {
            "en": "The final work emerges through layers of meaning and technique",
            "ru": "Окончательная работа возникает через слои смысла и техники",
            "es": "La obra final emerge a través de capas de significado y técnica",
            "zh": "最终作品通过意义和技术的层次呈现"
          },
          "image": "/images/works/hotel-series/IMG_5206.jpg"
        }
      ]
    }
  }
}
```

---

## 🎨 TypeScript Interface Definitions

### File Location
`/mnt/c/dev/project-kliee/project-box-v3-orm/frontend-sveltekit/src/lib/types/homepage.d.ts`

### Complete Type Definitions
```typescript
/**
 * Homepage Type Definitions
 * K-LIÉE Artist Portfolio
 *
 * @version 1.0
 * @date 2025-11-09
 */

// ============================================
// Common Types
// ============================================

export interface TranslatedString {
  en: string;
  ru: string;
  es: string;
  zh: string;
}

export interface PageMeta {
  title: TranslatedString;
  description: TranslatedString;
  keywords: TranslatedString;
}

// ============================================
// Hero Section
// ============================================

export interface HeroSlide {
  image: string;
  alt: TranslatedString;
  duration?: number; // milliseconds, default 4000
}

export interface HeroAnnouncement {
  highlight: TranslatedString;
  text: TranslatedString;
  link?: string;
}

export interface HeroSection {
  slides: HeroSlide[];
  title: TranslatedString;
  subtitle: TranslatedString;
  quote: TranslatedString;
  announcement?: HeroAnnouncement;
}

// ============================================
// Featured Collections Section
// ============================================

export interface WorkCollection {
  id: string;
  title: TranslatedString;
  description: TranslatedString;
  coverImage: string;
  link: string;
}

export interface FeaturedCollectionsSection {
  title: TranslatedString;
  subtitle: TranslatedString;
  collections: WorkCollection[];
}

// ============================================
// Exhibitions Section
// ============================================

export type ExhibitionStatus = 'current' | 'upcoming' | 'past';

export interface Exhibition {
  id: string;
  title: TranslatedString;
  description: TranslatedString;
  location: TranslatedString;
  workCount: number;
  dateRange: {
    start: string; // ISO date
    end: string | null; // ISO date or null for "Ongoing"
  };
  status: ExhibitionStatus;
  coverImage: string;
  link: string;
}

export interface ExhibitionsSection {
  title: TranslatedString;
  subtitle: TranslatedString;
  featured: Exhibition | null;
  viewAllLink: string;
}

// ============================================
// About Section
// ============================================

export interface AboutSection {
  title: TranslatedString;
  paragraphs: TranslatedString[];
  ctaText: TranslatedString;
  ctaLink: string;
  image: string;
  imageAlt: TranslatedString;
}

// ============================================
// News Section
// ============================================

export interface NewsItem {
  id: string;
  date: string; // Display format (e.g., "December 2024")
  title: TranslatedString;
  excerpt: TranslatedString;
  link: string | null;
}

export interface NewsSection {
  title: TranslatedString;
  items: NewsItem[];
}

// ============================================
// Testimonials Section
// ============================================

export interface TestimonialAuthor {
  name: string; // Not translated (proper names)
  title: TranslatedString;
}

export interface Testimonial {
  id: string;
  quote: TranslatedString;
  author: TestimonialAuthor;
}

export interface TestimonialsSection {
  title: TranslatedString;
  testimonials: Testimonial[];
}

// ============================================
// Creative Process Section
// ============================================

export interface ProcessStep {
  id: string;
  title: TranslatedString;
  description: TranslatedString;
  image: string;
}

export interface ProcessSection {
  title: TranslatedString;
  steps: ProcessStep[];
}

// ============================================
// Homepage Data (Root)
// ============================================

export interface HomepageSections {
  hero: HeroSection;
  featuredCollections: FeaturedCollectionsSection;
  exhibitions: ExhibitionsSection;
  about: AboutSection;
  news: NewsSection;
  testimonials: TestimonialsSection;
  process: ProcessSection;
}

export interface HomepageData {
  pageType: 'homepage';
  meta: PageMeta;
  sections: HomepageSections;
}
```

---

## 🎨 Component Props Specifications

### 1. Hero.svelte
```typescript
<script lang="ts">
  import type { HeroSection } from '$lib/types/homepage';

  interface Props {
    data: HeroSection;
    locale: string; // 'en' | 'ru' | 'es' | 'zh'
  }

  let { data, locale }: Props = $props();

  // State
  let currentSlide = $state(0);
  let isPaused = $state(false);

  // Derived
  let totalSlides = $derived(data.slides.length);

  // Effects
  $effect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
      }, 4000);
      return () => clearInterval(interval);
    }
  });
</script>
```

### 2. FeaturedWorks.svelte
```typescript
<script lang="ts">
  import type { FeaturedCollectionsSection } from '$lib/types/homepage';

  interface Props {
    data: FeaturedCollectionsSection;
    locale: string;
  }

  let { data, locale }: Props = $props();
</script>
```

### 3. ExhibitionsPreview.svelte
```typescript
<script lang="ts">
  import type { ExhibitionsSection } from '$lib/types/homepage';

  interface Props {
    data: ExhibitionsSection;
    locale: string;
  }

  let { data, locale }: Props = $props();
</script>
```

### 4. AboutPreview.svelte
```typescript
<script lang="ts">
  import type { AboutSection } from '$lib/types/homepage';

  interface Props {
    data: AboutSection;
    locale: string;
  }

  let { data, locale }: Props = $props();
</script>
```

### 5. NewsGrid.svelte
```typescript
<script lang="ts">
  import type { NewsSection } from '$lib/types/homepage';

  interface Props {
    data: NewsSection;
    locale: string;
  }

  let { data, locale }: Props = $props();
</script>
```

### 6. TestimonialGrid.svelte
```typescript
<script lang="ts">
  import type { TestimonialsSection } from '$lib/types/homepage';

  interface Props {
    data: TestimonialsSection;
    locale: string;
  }

  let { data, locale }: Props = $props();
</script>
```

### 7. ProcessGrid.svelte
```typescript
<script lang="ts">
  import type { ProcessSection } from '$lib/types/homepage';

  interface Props {
    data: ProcessSection;
    locale: string;
  }

  let { data, locale }: Props = $props();
</script>
```

---

## 📱 Responsive Design Requirements

### Breakpoints
```css
/* Mobile First Approach */
:root {
  --breakpoint-sm: 640px;   /* Small tablets */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Small laptops */
  --breakpoint-xl: 1280px;  /* Desktops */
  --breakpoint-2xl: 1536px; /* Large desktops */
}
```

### Typography Scaling
| Element | Mobile (375px) | Tablet (768px) | Desktop (1920px) |
|---------|----------------|----------------|------------------|
| H1 (Hero Title) | 48px | 80px | 120px |
| H2 (Section Title) | 32px | 40px | 48px |
| H3 (Card Title) | 20px | 24px | 28px |
| Body Text | 16px | 18px | 18px |
| Small Text | 14px | 14px | 14px |

### Spacing Scale
| Size | Mobile | Desktop |
|------|--------|---------|
| Section Padding | 60px 0 | 120px 0 |
| Container Max Width | 100% | 1200px |
| Grid Gap | 20px | 40px |
| Card Padding | 30px | 40px |

### Image Specifications
| Section | Desktop Size | Mobile Size | Format |
|---------|--------------|-------------|--------|
| Hero Slides | 1920x1080 | 768x1024 | WebP + JPG |
| Collection Cards | 700x1000 | 375x533 | WebP + JPG |
| Exhibition Cards | 800x600 | 375x281 | WebP + JPG |
| About Image | 600x900 | 375x563 | WebP + JPG |
| Process Images | 500x500 | 375x375 | WebP + JPG |

---

## 🌓 Dark Theme Specifications

### Color Mappings
```css
/* Light Theme (default) */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #555555;
  --accent-gold: #d4af37;
  --accent-red: #dc143c;
  --border-color: #e5e5e5;
}

/* Dark Theme */
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #0a0a0a;
  --text-primary: #ffffff;
  --text-secondary: #aaaaaa;
  --accent-gold: #ffd700;
  --accent-red: #ff6b6b;
  --border-color: #333333;
}
```

### Section-Specific Dark Mode Adjustments
1. **Hero Section**
   - Overlay gradient: Lighter (0.5 → 0.3 opacity)
   - Text shadows: 2px blur for readability

2. **Featured Works**
   - Card background: #111 instead of #000
   - Hover overlay: rgba(255,255,255,0.1)

3. **Testimonials**
   - Background: #111 instead of #000
   - Quote text: rgba(255,255,255,0.95)

4. **About Section**
   - Background: #0a0a0a instead of #f5f5f5
   - Image: No filter adjustments needed

---

## ♿ Accessibility Requirements

### WCAG AA Compliance
- **Color Contrast:** Minimum 4.5:1 for body text, 3:1 for large text
- **Focus Indicators:** Visible 2px outline on all interactive elements
- **Keyboard Navigation:** All interactive elements accessible via Tab
- **ARIA Labels:** Proper labeling for sliders, buttons, links

### Semantic HTML Structure
```html
<main>
  <section aria-labelledby="hero-title">
    <h1 id="hero-title">K-LIÉE</h1>
    <!-- Hero content -->
  </section>

  <section aria-labelledby="featured-title">
    <h2 id="featured-title">Featured Collections</h2>
    <!-- Collection grid -->
  </section>

  <!-- More sections... -->
</main>
```

### Screen Reader Considerations
- Image alt texts (from JSON data)
- ARIA live regions for slider announcements
- Skip navigation links (if needed)
- Descriptive link text (avoid "Click here")

---

## ⚡ Performance Optimizations

### Image Loading Strategy
1. **Hero images:** Preload first slide, lazy-load others
2. **Collection cards:** Intersection Observer lazy loading
3. **Below-the-fold sections:** Lazy load all images
4. **Format:** WebP with JPG fallback via `<picture>` element

### Code Splitting
```typescript
// Lazy load components not immediately visible
const TestimonialGrid = () => import('$lib/components/home/TestimonialGrid.svelte');
const ProcessGrid = () => import('$lib/components/home/ProcessGrid.svelte');
```

### CSS Optimizations
- Use CSS containment for cards
- GPU-accelerated transforms (translate3d)
- will-change hints for animations (use sparingly)

### Bundle Size Targets
- **Initial JS:** <100kb gzipped
- **Initial CSS:** <30kb gzipped
- **Total page weight:** <500kb (excluding images)

---

## 🧪 Testing Requirements

### Desktop Testing (1920px)
- [ ] All sections render correctly
- [ ] Hero slider auto-plays
- [ ] Hover states work on all cards
- [ ] Smooth scrolling between sections
- [ ] Images load progressively
- [ ] Dark theme toggle works

### Tablet Testing (768px)
- [ ] Grid adjusts to 2 columns
- [ ] Touch interactions work
- [ ] No horizontal overflow
- [ ] Readable text sizes
- [ ] Images scale properly

### Mobile Testing (375px)
- [ ] Single column layout
- [ ] Hero slider touch-swipeable
- [ ] Buttons min 44x44px touch targets
- [ ] No pinch-zoom needed
- [ ] Images optimized for mobile

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Samsung Internet (Android)

### Performance Testing
- [ ] Lighthouse Performance ≥90
- [ ] Lighthouse Accessibility ≥95
- [ ] Lighthouse SEO ≥95
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s

---

## 🔍 SEO Implementation

### Meta Tags (Per Language)
```html
<svelte:head>
  <title>{meta.title[locale]}</title>
  <meta name="description" content={meta.description[locale]} />
  <meta name="keywords" content={meta.keywords[locale]} />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content={meta.title[locale]} />
  <meta property="og:description" content={meta.description[locale]} />
  <meta property="og:image" content="/images/home/_MG_3235.jpg" />
  <meta property="og:url" content="https://k-lie.com/{locale}" />

  <!-- hreflang -->
  <link rel="alternate" hreflang="en" href="https://k-lie.com/en" />
  <link rel="alternate" hreflang="ru" href="https://k-lie.com/ru" />
  <link rel="alternate" hreflang="es" href="https://k-lie.com/es" />
  <link rel="alternate" hreflang="zh" href="https://k-lie.com/zh" />
  <link rel="alternate" hreflang="x-default" href="https://k-lie.com/en" />

  <!-- Canonical -->
  <link rel="canonical" href="https://k-lie.com/{locale}" />
</svelte:head>
```

### Schema.org Markup
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Svetlana K-Liée",
  "jobTitle": "Contemporary Artist",
  "url": "https://k-lie.com",
  "sameAs": [
    "https://instagram.com/Official.k.liee",
    "https://www.youtube.com/@SvetlanaKLiee"
  ],
  "nationality": "Russian",
  "workLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB"
    }
  },
  "knowsAbout": [
    "Bronze Sculpture",
    "Ceramic Art",
    "Contemporary Art",
    "Printmaking"
  ]
}
```

---

## 🎯 Implementation Roadmap

### Phase 1: Setup (4 hours)
1. Create `homepage.json` in `/data/` directory
2. Create TypeScript interfaces in `src/lib/types/homepage.d.ts`
3. Set up data loader in `src/routes/+page.ts`
4. Create component directory structure

### Phase 2: Core Components (16 hours)
1. **Hero.svelte** (4h) - Slider, animations, responsive
2. **FeaturedWorks.svelte** (3h) - Grid, hover effects
3. **ExhibitionsPreview.svelte** (2h) - Cards, badges
4. **AboutPreview.svelte** (2h) - Two-column layout
5. **NewsGrid.svelte** (2h) - Card grid
6. **TestimonialGrid.svelte** (2h) - Dark background section
7. **ProcessGrid.svelte** (1h) - Simple grid

### Phase 3: Page Assembly (4 hours)
1. Compose all sections in `+page.svelte`
2. Add SEO metadata with `<svelte:head>`
3. Implement smooth scrolling
4. Add section animations (fade-in on scroll)

### Phase 4: Responsive & Dark Theme (8 hours)
1. Mobile layouts for all components
2. Tablet breakpoint adjustments
3. Dark theme CSS variables
4. Test theme switching
5. Fix contrast issues

### Phase 5: Performance & Optimization (6 hours)
1. Implement lazy loading for images
2. Add intersection observers
3. Optimize bundle size
4. Add loading skeletons
5. Test on slow 3G

### Phase 6: Testing & QA (8 hours)
1. Desktop testing (all browsers)
2. Mobile testing (iOS/Android)
3. Accessibility audit (WAVE, Lighthouse)
4. Performance testing (PageSpeed)
5. Cross-language testing
6. Fix bugs and polish

### Phase 7: Documentation (4 hours)
1. Component documentation
2. Update README
3. Create style guide
4. Write deployment notes

---

## 🚀 Next Steps for Development

### Immediate Actions
1. **Copy this specification** to project docs folder
2. **Create homepage.json** with complete data structure
3. **Create TypeScript types** in `homepage.d.ts`
4. **Start with Hero component** (most complex, set the tone)
5. **Build incrementally** - test each component before moving on

### Development Order
```
1. Hero.svelte (foundation for animations)
2. FeaturedWorks.svelte (test grid system)
3. AboutPreview.svelte (test two-column layout)
4. ExhibitionsPreview.svelte (test card variations)
5. NewsGrid.svelte (reuse patterns from previous)
6. TestimonialGrid.svelte (dark theme testing)
7. ProcessGrid.svelte (simplest, quick win)
8. Assemble +page.svelte (compose everything)
9. Add SEO and polish
```

### Success Criteria
- ✅ All 8 sections render correctly
- ✅ Responsive on all breakpoints
- ✅ Dark theme works perfectly
- ✅ All 4 languages display correctly
- ✅ Lighthouse scores ≥90 (Performance, SEO, Accessibility)
- ✅ No TypeScript errors (`npm run check`)
- ✅ No console errors in browser

---

## 📚 Related Files

### Source Files
- `/mnt/c/dev/project-kliee/kliee-site-v1_2/index.html`
- `/mnt/c/dev/project-kliee/kliee-site-v1_2/css/main.css`

### Target Files (To Create)
- `/mnt/c/dev/project-kliee/project-box-v3-orm/data/homepage.json`
- `/mnt/c/dev/project-kliee/project-box-v3-orm/frontend-sveltekit/src/lib/types/homepage.d.ts`
- `/mnt/c/dev/project-kliee/project-box-v3-orm/frontend-sveltekit/src/lib/components/home/*.svelte`
- `/mnt/c/dev/project-kliee/project-box-v3-orm/frontend-sveltekit/src/routes/+page.svelte`
- `/mnt/c/dev/project-kliee/project-box-v3-orm/frontend-sveltekit/src/routes/+page.ts`

---

**End of Specification**

**Version:** 1.0
**Date:** 2025-11-09
**Status:** ✅ Ready for Implementation
**Estimated Timeline:** 40-50 hours
**Developer:** [Assign name]

---

**Let's build something beautiful! 🎨**
