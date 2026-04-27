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
  await expect(page.getByText("Click and drag to look around")).toBeVisible({ timeout: 8000 });
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
