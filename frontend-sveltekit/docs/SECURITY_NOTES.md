# Security Notes - K-LIEE Portfolio

**Last Updated:** 2025-12-20
**npm audit status:** 18 unfixable vulnerabilities

## Overview

This document describes known security vulnerabilities in dependencies that cannot be automatically fixed due to transitive dependencies.

## Unfixable Vulnerabilities

### 1. sha.js (CRITICAL)
- **Advisory:** GHSA-95m3-7q98-8xr5
- **Description:** Missing type checks leading to hash rewind
- **Root cause:** Dependency of `@lix-js/client` (used by paraglide-sveltekit)
- **Mitigation:** Low risk for this project - used only for i18n, not for security-critical operations
- **Action:** Monitor for paraglide updates

### 2. solid-js (HIGH)
- **Advisory:** GHSA-3qxh-p7jc-5xh6
- **Description:** XSS in JSX Fragments
- **Root cause:** Dependency of `@inlang/sdk` (paraglide)
- **Mitigation:** Not directly used in project code, internal to i18n tooling
- **Action:** Monitor for paraglide updates

### 3. devalue (HIGH)
- **Advisory:** GHSA-vj54-72f3-p5jv
- **Description:** Prototype pollution vulnerability
- **Root cause:** Old version in `@inlang/paraglide-sveltekit`
- **Mitigation:** Only used during build/dev, not runtime
- **Action:** Monitor for paraglide updates

### 4. cookie (LOW)
- **Advisory:** GHSA-pxg6-pf52-xh8x
- **Description:** Accepts cookie name with out of bounds characters
- **Root cause:** Dependency of `@sveltejs/kit`
- **Mitigation:** Low risk - SvelteKit validates cookies internally
- **Action:** Will be fixed in next SvelteKit major release

### 5. esbuild (MODERATE)
- **Advisory:** GHSA-67mh-4wv8-2f99
- **Description:** Dev server allows any requests
- **Root cause:** Dependency of `drizzle-kit`
- **Mitigation:** Only affects development mode, not production
- **Action:** Do not expose dev server publicly

## Recommendations

1. **Keep dependencies updated:** Run `npm update` regularly
2. **Monitor advisories:** Subscribe to GitHub security advisories
3. **Use production mode:** Never expose dev server to public
4. **Review before updates:** Check paraglide changelogs for security fixes

## Risk Assessment

| Vulnerability | Severity | Runtime Impact | Accepted Risk |
|---------------|----------|----------------|---------------|
| sha.js | CRITICAL | None (build only) | YES |
| solid-js | HIGH | None (build only) | YES |
| devalue | HIGH | None (build only) | YES |
| cookie | LOW | Minimal | YES |
| esbuild | MODERATE | Dev only | YES |

## Next Review Date

2025-01-20 (monthly review recommended)
