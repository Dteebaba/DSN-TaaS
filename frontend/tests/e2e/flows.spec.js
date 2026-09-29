const { test, expect } = require("@playwright/test");
const { open, testLogin, logout } = require("./helpers");

test.beforeEach(async ({ page }) => { await open(page); });

test("test access: every demo account can sign in", async ({ page }) => {
  const accounts = [["admin", "admin", "Overview"], ["recruiter", "RC-1001", "Find DSN talent"], ["recruiter", "RC-1002", "Find DSN talent"],
    ["member", "DSN-2024-0187", "Hello, Tunde"], ["member", "DSN-2025-0290", "Hello, Ibrahim"], ["reviewer", "RV-003", "Review queue"]];
  for (const [kind, id, text] of accounts) {
    await testLogin(page, kind, id);
    await expect(page.locator("main")).toContainText(text);
    await logout(page);
  }
});

test("manual log in with DSN ID and password", async ({ page }) => {
  await page.locator("[data-go=login]").first().click();
  await page.fill("#l-id", "DSN-2024-0187");
  await page.click("#login-form button[type=submit]");
  await page.fill("#l-pw", "demo1234");
  await page.click("#login-form button[type=submit]");
  await expect(page.locator("main")).toContainText("Hello, Tunde");
});

test("member requests several roles, reviewer sets final roles", async ({ page }) => {
  await testLogin(page, "member", "DSN-2025-0290");
  await page.click("[data-act=add-role]");
  await page.selectOption("#ar-role", "Business Analyst");
  await page.click("#addrole-form button[type=submit]");
  await page.locator(".card [data-act=req-role]").first().click();
  await expect(page.locator(".pv-role:checked")).toHaveCount(2);
  await page.check("#pv-sent");
  await page.click("[data-act=confirm-process]");
  await expect(page.locator(".crole.pend")).toHaveCount(2);
  await logout(page);

  await testLogin(page, "reviewer", "RV-003");
  await page.locator('tbody tr:has-text("DSN-2025-0290") >> text=Open').click();
  await page.selectOption("#d-lv-0", "Mid-Level");
  await page.fill("#d-note-0", "Strong SQL evidence.");
  await page.selectOption("#d-st-1", "rejected");
  await page.fill("#d-note-1", "Need requirements work samples.");
  await page.click("[data-act=rv-submit-role]");
  await logout(page);

  await page.locator("nav [data-go=directory]").click();
  await page.locator('.tcard:has-text("DSN-2025-0290")').click();
  await expect(page.locator(".vrole")).toContainText("Data Analyst");
  await expect(page.locator(".vrole")).toContainText("Mid-Level");
  await expect(page.locator(".crole.rej")).toContainText("Business Analyst");
});

test("reviewer rates a profile out of 100", async ({ page }) => {
  await testLogin(page, "reviewer", "RV-003");
  await page.click("[data-act=tab][data-val=rating]");
  await page.locator("text=Open").first().click();
  for (const k of ["tech", "projects", "experience", "education", "soft"]) await page.fill(`#sc-${k}`, "14");
  await expect(page.locator("#sc-total")).toHaveText("70");
  await page.click("[data-act=rv-submit-rating]");
  await expect(page.locator(".toast").last()).toContainText("70/100");
});

test("free partner cannot see names; subscribed partner can", async ({ page }) => {
  await testLogin(page, "recruiter", "RC-1002");
  await expect(page.locator(".tcard .nm").first()).toContainText("*");
  await logout(page);
  await testLogin(page, "recruiter", "RC-1001");
  await expect(page.locator(".tcard .nm").first()).not.toContainText("*");
  await page.locator(".tcard").first().click();
  await expect(page.locator("[data-act=request-talent]")).toBeVisible();
});

test("admin approves an application and the member can create a password", async ({ page }) => {
  await testLogin(page, "admin", "admin");
  await page.locator("nav [data-go=a-apps]").click();
  await page.locator('tr:has-text("DSN-2025-0412") [data-act=view-app]').click();
  await page.click("[data-act=approve-app]");
  await logout(page);
  await page.locator("[data-go=login]").first().click();
  await page.fill("#l-id", "DSN-2025-0412");
  await page.click("#login-form button[type=submit]");
  await page.fill("#l-email", "ngozi@example.com");
  await page.fill("#l-pw1", "newpass123");
  await page.fill("#l-pw2", "newpass123");
  await page.click("#login-form button[type=submit]");
  await expect(page.locator("main")).toContainText("Hello, Ngozi");
});
