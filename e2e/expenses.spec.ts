import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:4201';
const EMAIL = 'alice@semine.com';
const PASSWORD = 'password123';
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

/**
 * Login and wait for redirect to /profile.
 * After this, the loginTrigger has incremented and seed expenses will be written
 * to sessionStorage via Angular effects.
 */
async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  // Wait for navigation to /profile (where the app redirects after login)
  await page.waitForURL(`${BASE_URL}/profile`, { timeout: 10000 });
  // Allow Angular effects (seeding) time to write to sessionStorage
  await page.waitForTimeout(500);
}

/**
 * Navigate to /expenses using the sidebar routerLink (SPA navigation - no page reload).
 * This preserves Angular service state including seeded expenses.
 */
async function navigateToExpenses(page: Page) {
  // Use the sidebar "Expenses" link for SPA navigation
  await page.locator('a[routerLink="/expenses"], a[href="/expenses"]').click();
  await page.waitForURL(`${BASE_URL}/expenses`, { timeout: 5000 });
  await page.waitForLoadState('networkidle');
}

async function logout(page: Page) {
  await page.locator('button', { hasText: 'Logout' }).click();
  await page.waitForURL(`${BASE_URL}/login`, { timeout: 10000 });
}

/** Open the DEV panel by clicking the DEV tab. */
async function openDevPanel(page: Page) {
  const devTab = page.locator('button', { hasText: 'DEV' });
  await devTab.click();
  // Panel is open when DEV tab moves to right-80 position
  await expect(devTab).toHaveClass(/right-80/, { timeout: 5000 });
}

/** Save the DEV panel and wait for it to close (DEV tab returns to right-0). */
async function saveAndCloseDevPanel(page: Page) {
  await page.locator('button', { hasText: 'Save & Close' }).click();
  const devTab = page.locator('button', { hasText: 'DEV' });
  await expect(devTab).not.toHaveClass(/right-80/, { timeout: 5000 });
}

/** Reset DEV panel to defaults. */
async function resetDevPanel(page: Page) {
  const devTab = page.locator('button', { hasText: 'DEV' });
  await devTab.click();
  await expect(devTab).toHaveClass(/right-80/, { timeout: 5000 });
  await page.locator('button', { hasText: 'Reset' }).click();
  await saveAndCloseDevPanel(page);
}

/** Count PAID badges - the badge span contains text "PAID" (may include child spans). */
function paidBadges(page: Page) {
  return page.locator('span.bg-emerald-100.text-emerald-700');
}

/** Count PENDING badges. */
function pendingBadges(page: Page) {
  return page.locator('span.bg-amber-100.text-amber-700');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 1: Seed paid expenses on login
// ─────────────────────────────────────────────────────────────────────────────
test('Test 1: Seed paid expenses on login', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await login(page);
  // Navigate via SPA router to preserve Angular service state (incl. seeded expenses)
  await navigateToExpenses(page);

  // Wait for expenses to render (seed effect may still be processing)
  await page.waitForTimeout(500);

  const paidCount = await paidBadges(page).count();
  console.log(`[Test 1] Found ${paidCount} PAID badge(s)`);

  expect(paidCount).toBeGreaterThanOrEqual(1);
  expect(paidCount).toBeLessThanOrEqual(3);

  // Verify PAID expense cards do NOT have a delete button
  const expenseCards = page.locator('.group.relative.bg-white.rounded-xl');
  const cardCount = await expenseCards.count();
  console.log(`[Test 1] Total expense cards: ${cardCount}`);

  let paidCardsWithDeleteButton = 0;
  for (let i = 0; i < cardCount; i++) {
    const card = expenseCards.nth(i);
    const hasPaidBadge = await card.locator('span.bg-emerald-100.text-emerald-700').count();
    if (hasPaidBadge > 0) {
      const hasDeleteBtn = await card.locator('button[title="Remove expense"]').count();
      if (hasDeleteBtn > 0) {
        paidCardsWithDeleteButton++;
      }
    }
  }

  console.log(`[Test 1] PAID cards with delete button: ${paidCardsWithDeleteButton}`);
  expect(paidCardsWithDeleteButton).toBe(0);

  if (consoleErrors.length > 0) {
    console.log('[Test 1] Console errors:', consoleErrors);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: Add a pending expense
// ─────────────────────────────────────────────────────────────────────────────
test('Test 2: Add a pending expense', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await login(page);
  await navigateToExpenses(page);

  // Count PENDING badges before
  const pendingBefore = await pendingBadges(page).count();

  // Click "Add Expense"
  await page.locator('button', { hasText: 'Add Expense' }).click();
  // Wait for modal header
  await expect(page.locator('h2', { hasText: 'Add Expense' })).toBeVisible({ timeout: 5000 });

  // Fill Title
  await page.locator('input[placeholder="e.g. Team lunch at Noma"]').fill('Coffee meeting');

  // Fill Amount
  await page.locator('input[placeholder="0.00"]').fill('25.50');

  // Currency: select USD (first select in modal)
  await page.locator('select').first().selectOption('USD');

  // Category: select Meals (second select in modal)
  await page.locator('select').nth(1).selectOption('Meals');

  // Date: fill today
  await page.locator('input[type="date"]').fill(TODAY);

  // Click "Register Expense"
  await page.locator('button', { hasText: 'Register Expense' }).click();

  // Wait for modal to close
  await expect(page.locator('h2', { hasText: 'Add Expense' })).not.toBeVisible({ timeout: 5000 });

  // Verify the new expense appears
  await expect(page.locator('text=Coffee meeting')).toBeVisible({ timeout: 5000 });

  // Verify PENDING badge count increased
  const pendingAfter = await pendingBadges(page).count();
  console.log(`[Test 2] PENDING badges before: ${pendingBefore}, after: ${pendingAfter}`);
  expect(pendingAfter).toBeGreaterThan(pendingBefore);

  // Hover and verify delete button appears on PENDING expense
  const coffeeCard = page.locator('.group.relative.bg-white.rounded-xl', { hasText: 'Coffee meeting' });
  await coffeeCard.hover();

  const deleteBtn = coffeeCard.locator('button[title="Remove expense"]');
  await expect(deleteBtn).toBeVisible({ timeout: 3000 });
  console.log('[Test 2] Delete button visible on hover for PENDING expense');

  if (consoleErrors.length > 0) {
    console.log('[Test 2] Console errors:', consoleErrors);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: Monthly budget progress bar
// ─────────────────────────────────────────────────────────────────────────────
test('Test 3: Monthly budget progress bar', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await login(page);
  await navigateToExpenses(page);

  // Check for "Monthly Budget" card
  await expect(page.locator('text=Monthly Budget')).toBeVisible({ timeout: 5000 });
  console.log('[Test 3] Monthly Budget card is visible');

  const budgetCard = page.locator('.card', { hasText: 'Monthly Budget' });
  await expect(budgetCard).toBeVisible({ timeout: 5000 });

  // Verify current/max amounts format "$X.XX / $Y.YY"
  const budgetText = await budgetCard.textContent();
  console.log(`[Test 3] Budget card text: ${budgetText}`);
  expect(budgetText).toMatch(/\$[\d.]+\s*\/\s*\$[\d.]+/);

  // Verify progress bar container is visible
  const progressBarContainer = budgetCard.locator('.h-2.w-full.bg-gray-100.rounded-full');
  await expect(progressBarContainer).toBeVisible({ timeout: 5000 });
  console.log('[Test 3] Progress bar container is visible');

  // Verify progress fill div is present in DOM with width style
  // (At 0% it has zero width and may be invisible, so we check via DOM count + attribute)
  const progressFill = progressBarContainer.locator('div');
  const fillCount = await progressFill.count();
  expect(fillCount).toBeGreaterThan(0);

  const widthStyle = await progressFill.getAttribute('style');
  console.log(`[Test 3] Progress bar fill style: ${widthStyle}`);
  expect(widthStyle).toMatch(/width/);

  // Check "% used this month" text is present
  await expect(budgetCard.locator('text=/\\d+% used this month/')).toBeVisible({ timeout: 5000 });
  console.log('[Test 3] "% used this month" label is visible');

  if (consoleErrors.length > 0) {
    console.log('[Test 3] Console errors:', consoleErrors);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 4: Delete a pending expense
// ─────────────────────────────────────────────────────────────────────────────
test('Test 4: Delete a pending expense', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await login(page);
  await navigateToExpenses(page);

  // Add a pending expense first
  await page.locator('button', { hasText: 'Add Expense' }).click();
  await expect(page.locator('h2', { hasText: 'Add Expense' })).toBeVisible({ timeout: 5000 });

  await page.locator('input[placeholder="e.g. Team lunch at Noma"]').fill('Coffee meeting');
  await page.locator('input[placeholder="0.00"]').fill('25.50');
  await page.locator('select').first().selectOption('USD');
  await page.locator('select').nth(1).selectOption('Meals');
  await page.locator('input[type="date"]').fill(TODAY);
  await page.locator('button', { hasText: 'Register Expense' }).click();
  await expect(page.locator('h2', { hasText: 'Add Expense' })).not.toBeVisible({ timeout: 5000 });

  // Verify expense was added
  await expect(page.locator('text=Coffee meeting')).toBeVisible({ timeout: 5000 });
  const expenseCountBefore = await page.locator('.group.relative.bg-white.rounded-xl').count();
  console.log(`[Test 4] Expense cards before delete: ${expenseCountBefore}`);

  // Hover over the Coffee meeting card to reveal delete button
  const coffeeCard = page.locator('.group.relative.bg-white.rounded-xl', { hasText: 'Coffee meeting' });
  await coffeeCard.hover();

  const deleteBtn = coffeeCard.locator('button[title="Remove expense"]');
  await expect(deleteBtn).toBeVisible({ timeout: 3000 });

  // Click delete
  await deleteBtn.click();

  // Verify the expense is removed
  await expect(page.locator('text=Coffee meeting')).not.toBeVisible({ timeout: 5000 });
  const expenseCountAfter = await page.locator('.group.relative.bg-white.rounded-xl').count();
  console.log(`[Test 4] Expense cards after delete: ${expenseCountAfter}`);
  expect(expenseCountAfter).toBeLessThan(expenseCountBefore);

  if (consoleErrors.length > 0) {
    console.log('[Test 4] Console errors:', consoleErrors);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 5: DEV panel - disable expenses
// ─────────────────────────────────────────────────────────────────────────────
test('Test 5: DEV panel - disable expenses', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // On login page, open DEV panel and disable expenses
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  await openDevPanel(page);

  const expensesEnabledSwitch = page.locator('section', { hasText: 'expenses' }).locator('button[role="switch"]');
  const isCurrentlyEnabled = await expensesEnabledSwitch.getAttribute('aria-checked');
  console.log(`[Test 5] Expenses enabled before: ${isCurrentlyEnabled}`);

  if (isCurrentlyEnabled === 'true') {
    await expensesEnabledSwitch.click();
    await expect(expensesEnabledSwitch).toHaveAttribute('aria-checked', 'false', { timeout: 3000 });
  }

  await saveAndCloseDevPanel(page);

  // Login and navigate to expenses via SPA
  await login(page);
  await navigateToExpenses(page);

  // Verify "Feature not available" is shown
  await expect(page.locator('h2', { hasText: 'Feature not available' })).toBeVisible({ timeout: 5000 });
  console.log('[Test 5] "Feature not available" message is visible');

  await expect(page.locator("text=You don't have this feature enabled")).toBeVisible({ timeout: 5000 });
  console.log('[Test 5] Feature disabled description confirmed');

  // Verify NO "Add Expense" button
  const addButton = page.locator('button', { hasText: 'Add Expense' });
  const addButtonCount = await addButton.count();
  console.log(`[Test 5] "Add Expense" button count: ${addButtonCount}`);
  expect(addButtonCount).toBe(0);

  // Restore: logout and reset DEV panel
  await logout(page);
  await resetDevPanel(page);

  if (consoleErrors.length > 0) {
    console.log('[Test 5] Console errors:', consoleErrors);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 6: DEV panel - set low maxMonthlyAmount
// ─────────────────────────────────────────────────────────────────────────────
test('Test 6: DEV panel - set low maxMonthlyAmount', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // On login page, set maxMonthlyAmount to 1
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  await openDevPanel(page);

  const expensesSection = page.locator('section', { hasText: 'expenses' });
  const maxAmountInput = expensesSection.locator('input[type="number"]');
  await maxAmountInput.fill('1');

  await saveAndCloseDevPanel(page);

  // Login and navigate to expenses via SPA (seeds will push total > $1)
  await login(page);
  await navigateToExpenses(page);
  // Give seed effects time to compute total
  await page.waitForTimeout(500);

  // Verify quota exceeded banner
  await expect(page.locator('text=You have met your monthly expenses quota')).toBeVisible({ timeout: 5000 });
  console.log('[Test 6] Quota exceeded banner is visible');

  // Verify Add button is disabled
  const addButton = page.locator('button', { hasText: 'Add Expense' });
  await expect(addButton).toBeVisible({ timeout: 5000 });

  const isDisabled = await addButton.getAttribute('disabled');
  console.log(`[Test 6] Add button disabled attribute: ${isDisabled}`);
  expect(isDisabled).not.toBeNull();

  // Restore: logout and reset DEV panel
  await logout(page);
  await resetDevPanel(page);

  if (consoleErrors.length > 0) {
    console.log('[Test 6] Console errors:', consoleErrors);
  }
});
