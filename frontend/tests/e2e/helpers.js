const { expect } = require("@playwright/test");
/** Block third-party fonts/CDN so tests are fast and offline-friendly. */
async function open(page, path = "/") {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(path);
  await expect(page.locator("main")).toBeVisible();
}
/** Use the one-click test access buttons on the log-in page. */
async function testLogin(page, kind, id) {
  await page.locator("[data-go=login]").first().click();
  await page.locator(`[data-act=demo-login][data-kind=${kind}][data-id="${id}"]`).click();
}
async function logout(page) { await page.locator("[data-act=logout]").click(); }
module.exports = { open, testLogin, logout };
