import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: 'stereonet' })).toBeVisible();
});

test('inspector shows "No selection" on initial load', async ({ page }) => {
  const inspector = page.getByRole('region', { name: 'Feature inspector' });
  await expect(inspector).toContainText('No selection');
});

test('clicking a pole selects it and inspector shows geological fields', async ({ page }) => {
  const pole = page.locator('rect[data-id="plane-0"]');
  await expect(pole).toBeVisible();
  await pole.click();

  const inspector = page.getByRole('region', { name: 'Feature inspector' });
  await expect(inspector).not.toContainText('No selection');
  await expect(inspector).toContainText('Dip direction');
  await expect(inspector).toContainText('127°');
  await expect(inspector).toContainText('Dip');
  await expect(inspector).toContainText('45°');
});

test('clicking the same feature a second time deselects it', async ({ page }) => {
  const pole = page.locator('rect[data-id="plane-0"]');
  await expect(pole).toBeVisible();
  await pole.click();

  const inspector = page.getByRole('region', { name: 'Feature inspector' });
  await expect(inspector).not.toContainText('No selection');

  // Click again to toggle deselect
  await pole.click();
  await expect(inspector).toContainText('No selection');
});

test('moving the pointer inside the stereonet updates the cursor display', async ({ page }) => {
  const stereonet = page.getByRole('img', { name: 'stereonet' });
  const box = await stereonet.boundingBox();
  if (!box) throw new Error('Stereonet bounding box not found');

  // Move pointer inside stereonet
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

  const cursorDisplay = page.getByLabel('Cursor position');
  await expect(cursorDisplay).not.toContainText('—');
  await expect(cursorDisplay).toContainText('°');
});

test('moving the pointer off the stereonet shows the cursor placeholder', async ({ page }) => {
  const stereonet = page.getByRole('img', { name: 'stereonet' });
  const box = await stereonet.boundingBox();
  if (!box) throw new Error('Stereonet bounding box not found');

  // Move pointer inside first
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

  // Then move outside
  await page.mouse.move(box.x - 50, box.y - 50);

  const cursorDisplay = page.getByLabel('Cursor position');
  await expect(cursorDisplay).toContainText('—');
});
