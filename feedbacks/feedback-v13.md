# Feedback v13 - Session-1 TypeScript Errors (Updated)

**Date:** 2026-01-08
**Environment:** Local (WSL)
**Branch merged:** claude/setup-cms-admin-panels-x6wIa
**Commit main:** After merge of session-1
**Session:** session-1

---

## Context

Session-1 implementation complete with 5 changes:
- changes-1-shop-modul
- changes-2-work
- changes-3-Exhibitions
- changes-4-nft
- changes-5-about

After initial merge: **15 errors** found
After Developer fix (012cc8c): **7 errors** remain

**Command:** `npm run check`
**Current Result:** 7 errors, 341 warnings

---

## What Works

- [x] Merge completed successfully (52 files, +11,832 lines)
- [x] Dependencies installed
- [x] Exhibitions page type mismatch FIXED (012cc8c)

---

## Fixed (from original feedback)

### Bug 1: Exhibitions Page Type Mismatch - FIXED

Fixed in commit 012cc8c:
- Changed `exhibitions` to `pastExhibitions`
- Changed `exhibition.image` to `exhibition.coverImage`
- Added `formatLocation()` helper
- Changed `fair.gallery` to `fair.venue`

---

## Remaining Bugs (7 errors)

### Bug 2: Schema Mismatch - `venue` field

**Score:** 8
- Complexity: 2 (schema/DB mismatch)
- Files: 2 (API endpoints)
- Risk: 2 (admin API broken)
- Time: 2 (schema + migration)

**Where:**
1. `src/routes/api/content/exhibitions/+server.ts:53` - POST insert
2. `src/routes/api/content/exhibitions/[id]/+server.ts:75` - PUT update

**Error:**
```
Object literal may only specify known properties, and 'venue' does not exist in type
```

**Root cause:**
API endpoints use `venue` field, but `exhibitions` table schema doesn't have it.

**Fix required:**
Either:
- **Option A:** Add `venue` column to exhibitions schema (`src/lib/server/db/schema.ts`)
- **Option B:** Remove `venue` from API endpoints (use `city` instead?)

Check schema for existing fields: `city`, `country`, `galleryLink` exist but not `venue`.

---

### Bug 3: Schema Mismatch - `original_filename` field

**Score:** 6
- Complexity: 2 (schema mismatch)
- Files: 2 (admin pages)
- Risk: 1 (admin only)
- Time: 2

**Where:**
1. `src/routes/(admin)/about/+page.svelte:451`
2. `src/routes/(admin)/nft/[id]/+page.svelte:303`
3. `src/routes/(admin)/nft/[id]/+page.svelte:331`

**Error:**
```
Property 'original_filename' does not exist on type '{ id: number; filename: string; stored_filename: string; ... }'
```

**Root cause:**
Admin components expect `original_filename` on media records, but media schema only has:
- `filename`
- `stored_filename`

**Fix required:**
Either:
- **Option A:** Add `original_filename` to media schema
- **Option B:** Use `filename` instead of `original_filename` in components

---

### Bug 4: Drizzle eq() Type Mismatch

**Score:** 6
- Complexity: 2 (type casting)
- Files: 1
- Risk: 2 (provider broken)
- Time: 1

**Where:**
`src/lib/data/exhibitions.provider.ts:548`

**Error:**
```
No overload matches this call.
Argument of type 'string' is not assignable to parameter of type 'SQLWrapper | "solo" | "group" | "fair" | "biennale" | "other"'
```

**Root cause:**
`exhibitions.type` column has enum type, but function parameter is `string`.

**Fix required:**
Cast the parameter to the enum type:
```typescript
// Change from:
eq(exhibitions.type, type)

// Change to:
eq(exhibitions.type, type as 'solo' | 'group' | 'fair' | 'biennale' | 'other')
```

Or define the function parameter with the correct type.

---

### Bug 5: Unknown `multiline` prop

**Score:** 4
- Complexity: 1 (prop typo or missing)
- Files: 1
- Risk: 1 (admin only)
- Time: 1

**Where:**
`src/routes/(admin)/exhibitions/[id]/+page.svelte:217`

**Error:**
```
Object literal may only specify known properties, and '"multiline"' does not exist in type 'Props'
```

**Root cause:**
Component using `multiline` prop that doesn't exist in the target component's Props interface.

**Fix required:**
Either:
- Remove `multiline` prop if not needed
- Add `multiline` to the component's Props interface
- Check component import (might be using wrong component)

---

## Files to Modify

**Schema fixes:**
1. `src/lib/server/db/schema.ts` - add `venue` to exhibitions OR `original_filename` to media

**API fixes:**
2. `src/routes/api/content/exhibitions/+server.ts` - remove or fix `venue`
3. `src/routes/api/content/exhibitions/[id]/+server.ts` - remove or fix `venue`

**Provider fixes:**
4. `src/lib/data/exhibitions.provider.ts:548` - type cast for enum

**Admin page fixes:**
5. `src/routes/(admin)/about/+page.svelte` - use `filename` instead of `original_filename`
6. `src/routes/(admin)/nft/[id]/+page.svelte` - use `filename` instead of `original_filename`
7. `src/routes/(admin)/exhibitions/[id]/+page.svelte` - fix `multiline` prop

---

## Verification Checklist

After fix:

- [ ] `npm run check` returns 0 errors
- [ ] `npm run build` completes successfully
- [ ] Exhibitions page loads at `/en/exhibitions`
- [ ] Admin /about page loads without JS errors
- [ ] Admin /nft/[id] page loads without JS errors
- [ ] Admin /exhibitions/[id] page loads without JS errors
- [ ] CRUD operations work for exhibitions

---

*Integrator: Claude Code CLI*
*Ready for: Claude Code Web Developer*
*Priority: BLOCKING - must fix before build/deploy*
*Updated: 2026-01-08 after partial fix (012cc8c)*
