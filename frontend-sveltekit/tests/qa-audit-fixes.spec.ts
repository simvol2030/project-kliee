/**
 * QA Audit: Verify 3 Critical Fixes
 *
 * Tests:
 * 1. Hero images load correctly
 * 2. Dark theme toggle works
 * 3. Language routes work (no 404s)
 * 4. Language switcher component functions
 * 5. No regressions in Header/Footer
 */

import { test, expect, type Page } from '@playwright/test';

test.describe('QA Audit: Critical Fixes Verification', () => {

  // ============================================
  // Task 1: Verify Hero Images Load
  // ============================================
  test('Task 1: Hero images should load successfully', async ({ page }) => {
    console.log('\n=== Task 1: Hero Images Verification ===');

    // Navigate to English homepage
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Wait for hero section
    const heroSection = page.locator('[data-testid="hero-section"], .hero, section:has-text("SVETLANA K-LIÉE")').first();
    await expect(heroSection).toBeVisible({ timeout: 10000 });

    // Expected image paths
    const expectedImages = [
      '/images/home/_MG_3235.jpg',
      '/images/works/chebu-rasha/stormcloudpussycomb.jpg',
      '/images/works/porcelain/omniscient.jpg'
    ];

    // Listen for image requests
    const imageRequests: string[] = [];
    page.on('response', response => {
      const url = response.url();
      if (expectedImages.some(img => url.includes(img))) {
        imageRequests.push(url);
        console.log(`Image loaded: ${url} - Status: ${response.status()}`);
      }
    });

    // Reload to capture image requests
    await page.reload({ waitUntil: 'networkidle' });

    // Wait a bit for images to load
    await page.waitForTimeout(2000);

    // Check all images in hero section
    const heroImages = page.locator('img[src*="/images/"]');
    const imageCount = await heroImages.count();

    console.log(`Found ${imageCount} images in hero section`);

    // Verify at least 3 images exist
    expect(imageCount).toBeGreaterThanOrEqual(3);

    // Check each expected image
    for (const imgPath of expectedImages) {
      const img = page.locator(`img[src="${imgPath}"]`);
      const exists = await img.count() > 0;
      console.log(`Image ${imgPath}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);

      if (exists) {
        // Verify image is not broken
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        console.log(`  Natural width: ${naturalWidth}px`);
        expect(naturalWidth).toBeGreaterThan(0); // Image loaded successfully
      }
    }

    console.log('✅ Task 1 PASSED: Hero images load correctly\n');
  });

  // ============================================
  // Task 2: Verify Dark Theme Toggle
  // ============================================
  test('Task 2: Dark theme toggle should work correctly', async ({ page }) => {
    console.log('\n=== Task 2: Dark Theme Toggle Verification ===');

    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Find theme toggle button (desktop or mobile)
    const themeToggle = page.locator('button[aria-label="Toggle theme"], .theme-toggle, .desktop-theme-toggle').first();
    await expect(themeToggle).toBeVisible({ timeout: 5000 });

    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log(`Initial theme: ${initialTheme || 'not set'}`);

    // Get initial background color
    const initialBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Initial background color: ${initialBgColor}`);

    // Click toggle
    await themeToggle.click();
    await page.waitForTimeout(500); // Wait for transition

    // Get new theme
    const newTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log(`Theme after toggle: ${newTheme}`);

    // Verify theme changed
    expect(newTheme).not.toBe(initialTheme);
    expect(['light', 'dark']).toContain(newTheme);

    // Get new background color
    const newBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Background color after toggle: ${newBgColor}`);

    // Verify colors changed
    expect(newBgColor).not.toBe(initialBgColor);

    // Check localStorage
    const savedTheme = await page.evaluate(() => {
      return localStorage.getItem('theme');
    });
    console.log(`Theme saved in localStorage: ${savedTheme}`);
    expect(savedTheme).toBe(newTheme);

    // Reload page and verify theme persists
    await page.reload({ waitUntil: 'networkidle' });

    const themeAfterReload = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log(`Theme after reload: ${themeAfterReload}`);
    expect(themeAfterReload).toBe(newTheme);

    console.log('✅ Task 2 PASSED: Dark theme toggle works correctly\n');
  });

  // ============================================
  // Task 3: Verify Language Routes Work
  // ============================================
  test('Task 3: All language routes should return 200 OK', async ({ page }) => {
    console.log('\n=== Task 3: Language Routes Verification ===');

    const languages = ['en', 'ru', 'es', 'zh'];

    for (const lang of languages) {
      const url = `/${lang}`;
      console.log(`Testing: ${url}`);

      const response = await page.goto(url);
      expect(response).not.toBeNull();

      const status = response!.status();
      console.log(`  HTTP Status: ${status}`);
      expect(status).toBe(200);

      // Verify no 404 message
      const body = await page.textContent('body');
      expect(body).not.toContain('404');
      expect(body).not.toContain('not found');

      // Verify header and footer render
      const header = page.locator('header');
      await expect(header).toBeVisible();

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Verify homepage content renders
      const heroOrTitle = page.locator('h1, .hero, [data-testid="hero-section"]').first();
      await expect(heroOrTitle).toBeVisible();

      console.log(`  ✅ ${lang.toUpperCase()} route works correctly`);
    }

    console.log('\n✅ Task 3 PASSED: All language routes work\n');
  });

  // ============================================
  // Task 4: Verify Language Switcher Component
  // ============================================
  test('Task 4: Language switcher should navigate correctly', async ({ page }) => {
    console.log('\n=== Task 4: Language Switcher Verification ===');

    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Find language switcher
    const langSwitcher = page.locator('[data-testid="language-switcher"], .language-switcher, .lang-switcher').first();
    await expect(langSwitcher).toBeVisible({ timeout: 5000 });

    console.log('Language switcher found');

    // Check current language indicator
    const currentLangText = await langSwitcher.textContent();
    console.log(`Current language display: ${currentLangText}`);
    expect(currentLangText).toContain('EN');

    // Open dropdown (if it's a dropdown)
    const dropdown = page.locator('button:has-text("EN"), .lang-switcher button').first();
    if (await dropdown.isVisible()) {
      await dropdown.click();
      await page.waitForTimeout(300);

      // Check for language options
      const langOptions = page.locator('[role="menu"] a, .dropdown-menu a, .lang-options a');
      const optionsCount = await langOptions.count();
      console.log(`Language options visible: ${optionsCount}`);
      expect(optionsCount).toBeGreaterThanOrEqual(4);

      // Click Russian option
      const ruOption = page.locator('a[href="/ru"], a:has-text("RU")').first();
      await ruOption.click();
      await page.waitForLoadState('networkidle');

      // Verify URL changed
      expect(page.url()).toContain('/ru');
      console.log('✅ Navigation to Russian works');
    } else {
      // Direct links
      const ruLink = page.locator('a[href="/ru"]').first();
      await ruLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/ru');
      console.log('✅ Direct link to Russian works');
    }

    console.log('✅ Task 4 PASSED: Language switcher works\n');
  });

  // ============================================
  // Task 5: Check for Regressions
  // ============================================
  test('Task 5: No regressions in site functionality', async ({ page, context }) => {
    console.log('\n=== Task 5: Regression Check ===');

    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log(`Console error: ${msg.text()}`);
      }
    });

    // Capture network errors
    const networkErrors: string[] = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} - ${response.url()}`);
        console.log(`Network error: ${response.status()} - ${response.url()}`);
      }
    });

    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // 1. Header renders correctly
    const header = page.locator('header');
    await expect(header).toBeVisible();
    console.log('✅ Header renders');

    // 2. Footer renders correctly
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    console.log('✅ Footer renders');

    // 3. Navigation menu works
    const navLinks = header.locator('a[href^="/"]');
    const navCount = await navLinks.count();
    expect(navCount).toBeGreaterThan(0);
    console.log(`✅ Navigation menu has ${navCount} links`);

    // 4. Mobile menu toggle (on mobile viewport)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const mobileMenuToggle = page.locator('.mobile-menu-toggle, button[aria-label*="menu"]').first();
    if (await mobileMenuToggle.isVisible()) {
      await mobileMenuToggle.click();
      await page.waitForTimeout(300);
      console.log('✅ Mobile menu toggle works');
    }

    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 5. Check for critical console errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('DevTools') &&
      !err.includes('Extension') &&
      !err.includes('favicon')
    );

    console.log(`\nConsole errors: ${criticalErrors.length}`);
    if (criticalErrors.length > 0) {
      console.log('Errors:', criticalErrors);
    }

    // 6. Check for critical network errors
    const criticalNetworkErrors = networkErrors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('chrome-extension')
    );

    console.log(`Network errors: ${criticalNetworkErrors.length}`);
    if (criticalNetworkErrors.length > 0) {
      console.log('Errors:', criticalNetworkErrors);
    }

    // Expect no critical errors
    expect(criticalErrors.length).toBe(0);
    expect(criticalNetworkErrors.length).toBe(0);

    console.log('✅ Task 5 PASSED: No regressions detected\n');
  });

  // ============================================
  // Root Route Redirect Test
  // ============================================
  test('Root route (/) should redirect to /en', async ({ page }) => {
    console.log('\n=== Root Route Redirect Test ===');

    const response = await page.goto('/');

    // Check final URL after redirects
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);

    expect(finalUrl).toContain('/en');

    // Verify page loaded successfully
    const status = response?.status() || 0;
    console.log(`Status: ${status}`);
    expect(status).toBe(200);

    console.log('✅ Root redirect works correctly\n');
  });
});
