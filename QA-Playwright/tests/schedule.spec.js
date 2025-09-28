import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("user@example.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("textbox", { name: "Password" }).press("Enter");
  await page.waitForTimeout(1000);

  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForTimeout(1000);

  await page.getByRole("link", { name: "Schedule Posts" }).click();
  await page.waitForTimeout(1000);

  await page.getByRole("button", { name: "Create New Post" }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Schedule Post" }).click();
  await page.waitForTimeout(1000);

});
