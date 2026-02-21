# Session-4: Checklist — Admin UX Fixes

**Дата:** 2026-02-21
**Статус:** PLANNING

---

## Changes Overview

| # | Change | Тип | Кто | Score |
|---|--------|-----|-----|-------|
| 1 | Bug Fixes (blog, layout, flags) | Bug | Developer | 8-17 |
| 2 | Homepage Admin Redesign | Feature | Developer | 17 |
| 3 | Admin Sidebar Restructure | Feature | Developer | 8 |

---

## High-Level Checklist

### Changes-1: Bug Fixes

- [ ] `/en/blog` и `/ru/blog` — список постов отображается (не пустой)
- [ ] `/dashboard` + `/blog` + `/homepage` в адмике — нет публичного layout (header/footer сайта)
- [ ] Флаги языков в хедере и мобильном меню — отображаются как картинки, не пустые квадраты
- [ ] Консоль браузера — нет 500 ошибок на страницах блога (admin + public)

### Changes-2: Homepage Admin Redesign

- [ ] `/homepage` — страница прокручивается (скролл), не переключает табы
- [ ] Все 7 секций (Hero, About, News, Testimonials, Process, Collections, Exhibitions) — видны на странице одновременно
- [ ] Каждая секция — имеет заголовок/разделитель для навигации
- [ ] Кнопки Save работают для каждой секции независимо
- [ ] Мобильная версия — секции вертикально, удобно

### Changes-3: Admin Sidebar Restructure

- [ ] Sidebar — логический порядок секций
- [ ] Blog — добавлен в правильную секцию (Content)
- [ ] Все существующие ссылки работают (нет сломанной навигации)

---

## QA URLs

- Admin: https://k-liee.com/login (admin@kliee.com / Admin123!@#$)
- Public EN: https://k-liee.com/en
- Public blog: https://k-liee.com/en/blog
- Admin blog: https://k-liee.com/blog
- Admin homepage: https://k-liee.com/homepage
