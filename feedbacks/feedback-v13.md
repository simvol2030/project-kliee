# Feedback v13 - Session-1 TypeScript Errors (Exhibitions)

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

After merge, TypeScript check found **15 errors** blocking build.

**Command:** `npm run check`
**Result:** 15 errors, 341 warnings

---

## What Works

- [x] Merge completed successfully (52 files, +11,832 lines)
- [x] Dependencies installed
- [x] Most providers compile correctly

---

## Bugs (score 6+)

### Bug 1: Exhibitions Page Type Mismatch

**Score:** 9
- Complexity: 3 (data structure mismatch)
- Files: 2 (page.server.ts, page.svelte, types)
- Risk: 2 (public page broken)
- Time: 2 (>10 min)

**Where:**
- `src/routes/[lang=locale]/exhibitions/+page.svelte`
- `src/routes/[lang=locale]/exhibitions/+page.server.ts`
- `src/lib/types/content.types.ts` (ExhibitionLocalized interface)

**Error messages:**
```
Error: src/routes/[lang=locale]/exhibitions/+page.svelte:9:36
Property 'exhibitions' does not exist on type '{ currentExhibitions: ExhibitionLocalized[]; pastExhibitions: ExhibitionLocalized[]; artFairs: ExhibitionLocalized[]; seo: { title: string; description: string; }; }'

Error: src/routes/[lang=locale]/exhibitions/+page.svelte:26:43
Property 'image' does not exist on type 'ExhibitionLocalized'

Error: src/routes/[lang=locale]/exhibitions/+page.svelte:27:49
Property 'location' does not exist on type 'ExhibitionLocalized'

Error: src/routes/[lang=locale]/exhibitions/+page.svelte:28:47
Property 'gallery' does not exist on type 'ExhibitionLocalized'

Error: src/routes/[lang=locale]/exhibitions/+page.svelte:51:10
Parameter 'e' implicitly has an 'any' type
```

**Root cause:**

1. **+page.server.ts returns:**
```typescript
return {
  currentExhibitions,  // ExhibitionLocalized[]
  pastExhibitions,     // ExhibitionLocalized[]
  artFairs,            // ExhibitionLocalized[]
  seo
};
```

2. **+page.svelte expects:**
```typescript
const { exhibitions, artFairs, currentExhibitions, seo } = data;
// ❌ 'exhibitions' doesn't exist - server returns 'pastExhibitions'
```

3. **ExhibitionLocalized interface missing fields:**
   - `image: string`
   - `location: string`
   - `gallery: string`

**Steps to reproduce:**
1. `cd frontend-sveltekit`
2. `npm run check`
3. See TypeScript errors

**Expected:**
- `npm run check` passes with 0 errors
- `npm run build` succeeds

**Actual:**
- 15 TypeScript errors
- Build fails

**Fix required:**

**Option A (recommended):** Fix +page.svelte to use correct property names:
```typescript
// Change from:
const { exhibitions, artFairs, currentExhibitions, seo } = data;

// Change to:
const { pastExhibitions, artFairs, currentExhibitions, seo } = data;
// Then rename 'exhibitions' to 'pastExhibitions' in template
```

**Option B:** Fix +page.server.ts to return expected property names:
```typescript
return {
  exhibitions: pastExhibitions,  // alias
  currentExhibitions,
  artFairs,
  seo
};
```

**Also fix ExhibitionLocalized type** (`src/lib/types/content.types.ts`):
```typescript
export interface ExhibitionLocalized {
  id: string;
  // ... existing fields ...
  image: string;      // ADD
  location: string;   // ADD
  gallery: string;    // ADD
}
```

**Also fix parameter type** (line 51):
```typescript
// Change from:
(e) => ...

// Change to:
(e: ExhibitionLocalized) => ...
```

---

## Verification Checklist

After fix:

- [ ] `npm run check` returns 0 errors
- [ ] `npm run build` completes successfully
- [ ] Exhibitions page loads at `/en/exhibitions`
- [ ] Current exhibitions section displays correctly
- [ ] Past exhibitions section displays correctly
- [ ] Art fairs section displays correctly
- [ ] Images load (no 404)
- [ ] All 4 languages work (EN/RU/ES/ZH)

---

## Files to Modify

1. `src/routes/[lang=locale]/exhibitions/+page.svelte` - fix property names, add types
2. `src/lib/types/content.types.ts` - add missing fields to ExhibitionLocalized
3. Possibly `src/lib/data/exhibitions.provider.ts` - ensure returned data has all fields

---

*Integrator: Claude Code CLI*
*Ready for: Claude Code Web Developer*
*Priority: BLOCKING - must fix before build/deploy*
