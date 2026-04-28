import { expect, test, type Page } from "@playwright/test";

async function expectStartOverlaySpacing(page: Page) {
  const intakeBounds = await page.locator(".start-intake").boundingBox();
  const buttonBounds = await page.getByRole("button", { name: "Open your eyes" }).boundingBox();
  expect(intakeBounds).not.toBeNull();
  expect(buttonBounds).not.toBeNull();
  if (intakeBounds && buttonBounds) {
    expect(buttonBounds.y).toBeGreaterThanOrEqual(intakeBounds.y + intakeBounds.height);
  }
}

test("renders the fixed bedroom scene", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Hello Clarice/);
  await expect(page.getByTestId("bedroom-canvas")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open your eyes" })).toBeVisible();
  await expectStartOverlaySpacing(page);
  await page.getByRole("button", { name: "Open your eyes" }).click();
  await expect(page.getByText("...where's my phone?")).toBeVisible({ timeout: 8000 });
  await expect(page.getByText("Click and drag to look around")).toBeVisible({ timeout: 11000 });
  await page.waitForTimeout(600);

  const nonBlankPixels = await page.evaluate(async () => {
    const source = document.querySelector("canvas");
    if (!source) return 0;

    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 80;
    const context = canvas.getContext("2d");
    if (!context) return 0;

    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      if (red + green + blue > 8) count += 1;
    }

    return count;
  });

  expect(nonBlankPixels).toBeGreaterThan(100);
});

test("keeps start overlay fields separated on small viewports", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Open your eyes" })).toBeVisible();
  await expectStartOverlaySpacing(page);
});

test("social feed click triggers blackout then closes panel", async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto("/?e2e=1");
  await page.getByRole("button", { name: "Open your eyes" }).click();
  await expect(page.getByRole("button", { name: "Open phone panel (e2e)" })).toBeVisible({
    timeout: 11_000,
  });

  await page.getByRole("button", { name: "Open phone panel (e2e)" }).click();
  await expect(page.getByLabel("Open social feed")).toBeVisible();
  await page.getByLabel("Open social feed").click();

  await expect(page.locator(".phone-social-blackout")).toBeVisible({ timeout: 13_000 });
  await expect(page.locator(".phone-focus-panel")).toBeHidden({ timeout: 16_000 });
  await expect(page.locator(".post-phone-dialogue")).toBeVisible({ timeout: 4_000 });
});
