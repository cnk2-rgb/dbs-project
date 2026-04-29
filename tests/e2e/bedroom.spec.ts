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
    timeout: 18_000,
  });

  await page.getByRole("button", { name: "Open phone panel (e2e)" }).click();
  await expect(page.getByLabel("Open social feed")).toBeVisible();
  await page.getByLabel("Open social feed").click();

  await expect(page.locator(".phone-social-blackout")).toBeVisible({ timeout: 13_000 });
  await expect(page.locator(".phone-focus-panel")).toBeHidden({ timeout: 16_000 });
  await expect(page.getByText("use WASD to move")).toBeVisible({ timeout: 4_000 });
  await expect(page.locator(".post-phone-dialogue")).toBeVisible({ timeout: 4_000 });
});

test("skip intro lets player pick up phone instead of opening panel", async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto("/?e2e=1");
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(page.getByRole("button", { name: "Interact phone prop (e2e)" })).toBeVisible({ timeout: 8_000 });

  await page.getByRole("button", { name: "Interact phone prop (e2e)" }).click();
  await expect(page.getByText("... I should take my phone with me just in case")).toBeVisible({ timeout: 3_000 });
  await expect(page.getByText("press o to open phone")).toBeVisible({ timeout: 3_000 });
  await expect(page.locator(".phone-focus-panel")).toBeHidden();
  await expect(page.getByText("Click and drag to look around")).toBeHidden();
});

test("directives do not overlap and keep spacing from phone panel", async ({ page }) => {
  test.setTimeout(70_000);
  await page.goto("/?e2e=1");
  await page.getByRole("button", { name: "Open your eyes" }).click();

  await expect(page.getByRole("button", { name: "Open phone panel (e2e)" })).toBeVisible({
    timeout: 18_000,
  });

  await page.getByRole("button", { name: "Open phone panel (e2e)" }).click();
  await expect(page.locator(".phone-focus-panel")).toBeVisible({ timeout: 4_000 });
  await page.mouse.click(20, 20);
  await expect(page.locator(".phone-focus-panel")).toBeHidden({ timeout: 4_000 });

  await expect(page.locator(".post-phone-dialogue")).toBeVisible({ timeout: 4_000 });
  await expect(page.getByText("... I should take my phone with me just in case")).toBeHidden({ timeout: 2_000 });

  await page.waitForTimeout(7600);
  await expect(page.getByText("... I should take my phone with me just in case")).toBeVisible({ timeout: 4_000 });

  const dialogueCount = await page.locator(".post-phone-dialogue").count();
  expect(dialogueCount).toBe(1);

  await page.getByRole("button", { name: "Collect phone (e2e)" }).click();

  await expect(page.getByText("press o to open phone")).toBeVisible({ timeout: 3_000 });
  await page.keyboard.press("o");
  await expect(page.locator(".phone-focus-panel")).toBeVisible({ timeout: 4_000 });
  await expect(page.getByText("click outside the phone to close")).toBeVisible({ timeout: 2_000 });

  const hint = page.locator(".phone-close-hint");
  const hintBox = await hint.boundingBox();
  const panelBox = await page.locator(".phone-focus-panel").boundingBox();
  expect(hintBox).not.toBeNull();
  expect(panelBox).not.toBeNull();
  if (hintBox && panelBox) {
    const horizontalGap = Math.max(
      panelBox.x - (hintBox.x + hintBox.width),
      hintBox.x - (panelBox.x + panelBox.width),
      0,
    );
    const verticalGap = Math.max(
      panelBox.y - (hintBox.y + hintBox.height),
      hintBox.y - (panelBox.y + panelBox.height),
      0,
    );
    const overlapX = Math.min(hintBox.x + hintBox.width, panelBox.x + panelBox.width) - Math.max(hintBox.x, panelBox.x);
    const overlapY =
      Math.min(hintBox.y + hintBox.height, panelBox.y + panelBox.height) - Math.max(hintBox.y, panelBox.y);

    expect(overlapX <= 0 || overlapY <= 0).toBeTruthy();
    expect(Math.max(horizontalGap, verticalGap)).toBeGreaterThanOrEqual(8);
  }
});
