# Feedback v16 - M-1 Bug NOT Fully Fixed

**Date:** 2026-01-09
**Environment:** Production (https://k-liee.com)
**Branch merged:** claude/setup-cms-admin-panels-x6wIa
**Session:** session-1 (continuation)
**Priority:** HIGH - 70 images still broken

---

## Summary

After deploying Developer's fixes from feedback-v15, verification shows that bug **M-1 (Image Path Duplication)** is NOT fully resolved. The buildMediaUrl() helper was added but uses wrong logic for old image paths.

---

## Bug M-1: Still Broken (Score 8 - CRITICAL)

### Symptoms (verified in browser):
- Media Library: All old images show "0 B" file size
- Console: 404 errors for image URLs
- 70 database records affected

### Root Cause Analysis

**Database has two types of media records:**

| Type | stored_filename | folder | Count |
|------|-----------------|--------|-------|
| NEW (correct) | `chebu-rasha-blue.jpg` | `products` | ~40 |
| OLD (problematic) | `/images/works/chebu-rasha/7_2.jpg` | `images/works/chebu-rasha` | 70 |

**Nginx config (k-liee.com.conf):**
```nginx
location /images/ {
    alias /opt/websites/k-liee.com/static-images/images/;
}

location /uploads/ {
    alias /opt/websites/k-liee.com/static-images/uploads/;
}
```

**Current buildMediaUrl() logic:**
```typescript
if (storedFilename.startsWith('/')) {
    return `/uploads${storedFilename}`;  // Returns /uploads/images/...
}
```

**Result for old images:**
- Input: `stored_filename = '/images/works/chebu-rasha/7_2.jpg'`
- Output: `/uploads/images/works/chebu-rasha/7_2.jpg`
- Nginx maps to: `static-images/uploads/images/works/...` (WRONG!)
- Actual file at: `static-images/images/works/...`

### Fix Required

**Option A: Fix buildMediaUrl() (RECOMMENDED)**

Update all buildMediaUrl() functions:

```typescript
function buildMediaUrl(folder: string | null, storedFilename: string): string {
    // Old images: stored_filename starts with /images/ - use directly
    if (storedFilename.startsWith('/images/')) {
        return storedFilename;  // Served by nginx /images/ location
    }

    // Legacy: other paths starting with /
    if (storedFilename.startsWith('/')) {
        return `/uploads${storedFilename}`;
    }

    // Modern: relative paths
    if (storedFilename.includes('/')) {
        return `/uploads/${storedFilename}`;
    }

    // Simple filename
    return `/uploads/${folder || 'uploads'}/${storedFilename}`;
}
```

**Files to update:**
1. `src/routes/(admin)/media/+page.server.ts` (line 8-16)
2. `src/routes/(admin)/series/[id]/+page.server.ts` (line 8-16)
3. `src/routes/api/media/+server.ts` (line 9-17)
4. `src/lib/data/nft.provider.ts` (line 106-109) - needs full update
5. `src/lib/data/about.provider.ts` (line 127-130) - needs full update

**Option B: Nginx quick fix**

Add redirect in nginx (temporary workaround):
```nginx
location /uploads/images/ {
    alias /opt/websites/k-liee.com/static-images/images/;
}
```

### Verification Steps (post-fix)

```bash
# 1. Check URL generation
curl -s "https://k-liee.com/api/media" | jq '.media[40:42]'
# Should see URLs starting with /images/ for old records

# 2. Test image loads
curl -I "https://k-liee.com/images/works/chebu-rasha/7_2.jpg"
# Should return 200 OK

# 3. Browser check
# Open /media - all images should display with correct file sizes
```

---

## Bug E-1: Exhibition Edit Now 500 Error (Score 8 - CRITICAL)

### Symptom:
- Click Edit on any exhibition → 500 Server Error (was 400 before)
- URL: `/exhibitions/tales-xenophobia-paris-2024`

### Expected:
Edit form opens successfully.

### Actual:
500 "Server Error - Something went wrong on our end"

### Root Cause:
The Developer's fix changed error handling but still fails. Likely the `getExhibitionId()` function or related logic has an issue.

### Files to check:
- `src/routes/(admin)/exhibitions/[id]/+page.server.ts`

---

## Other Fixes from v15 - Verification Complete

| Bug | Status | Verified |
|-----|--------|----------|
| E-1: Exhibition edit 400 | **STILL BROKEN (now 500)** | YES - FAIL |
| E-2: Exhibitions columns | **FIXED** | YES - OK |
| N-1: NFT Title/Desc TABS | **FIXED** | YES - OK |
| A-1: About Biography TABS | **FIXED** | YES - OK |
| A-3: Education multilingual | **FIXED** | YES - OK |
| S-1: Series MediaPicker | **FIXED** | YES - OK |
| M-2: Video upload | NOT IMPLEMENTED | NOT TESTED |

---

## Summary of Bugs Remaining

| ID | Bug | Score | Status |
|----|-----|-------|--------|
| M-1 | Media Library paths (70 old images broken) | 8 | NOT FIXED |
| E-1 | Exhibition edit 500 error | 8 | NOT FIXED |
| M-2 | Video upload capability | 6 | NOT IMPLEMENTED |

---

## Branch to Create

```
claude/fix-media-url-paths-v16
```

---

*Prepared by: CLI Integrator*
*For: Claude Code Web Developer*
*Action Required: Fix buildMediaUrl() logic for /images/ paths*
*Expected outcome: All 70 old images display correctly in Media Library*
