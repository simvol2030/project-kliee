# Session-3: Checklist

**Session:** session-3
**Changes:** 3 (Contact Telegram, Homepage CMS, Blog)
**Date:** 2026-02-19

---

## Session-level Checklist (all changes deployed)

### Changes-1: Contact Telegram
- [ ] Admin `/contact` Settings tab shows "Telegram Notifications" section
- [ ] Bot Token and Chat ID fields save correctly
- [ ] "Test Telegram" button sends test message
- [ ] Contact form submission at `/en/contact` sends Telegram notification (when enabled)
- [ ] Disabling Telegram toggle stops Telegram notifications (email still works)

### Changes-2: Homepage CMS
- [ ] Homepage loads data from DB (not static JSON)
- [ ] Admin `/homepage` — all existing tabs still work (Hero, About, News, Testimonials, Process)
- [ ] Admin `/homepage` — new tab: Featured Collections
- [ ] Admin changes reflect on public homepage immediately
- [ ] Fallback to JSON if DB is empty

### Changes-3: Blog
- [ ] Admin `/blog` — list with DataTable, search, filters
- [ ] Admin `/blog/new` — create post with TipTap editor, 4 languages
- [ ] Admin `/blog/[id]` — edit existing post
- [ ] Public `/[lang]/blog/` — list of published posts with cards
- [ ] Public `/[lang]/blog/[slug]` — full article view
- [ ] Blog link visible in admin sidebar (Content section)
- [ ] Blog link visible in public navigation menu
- [ ] SEO meta tags on blog pages

### Cross-cutting
- [ ] No TypeScript errors (`npm run check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Dark mode works for all new admin UI
- [ ] Mobile responsive for all new pages
- [ ] i18n: all 4 languages work (en/ru/es/zh)

---

*Generated: 2026-02-19*
