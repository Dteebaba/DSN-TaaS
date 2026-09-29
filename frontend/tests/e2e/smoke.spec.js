const { test, expect } = require("@playwright/test");
const { open } = require("./helpers");

test("welcome page loads with no script errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await open(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome to the DSN Talent Platform");
  await expect(page.locator(".door")).toHaveCount(3);
  expect(errors).toEqual([]);
});

test("page never scrolls sideways", async ({ page }) => {
  await open(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("public directory hides names", async ({ page }) => {
  await open(page);
  await page.locator("nav [data-go=directory]").click();
  await expect(page.locator(".tcard").first()).toBeVisible();
  await expect(page.locator(".tcard .nm").first()).toContainText("*");
});
