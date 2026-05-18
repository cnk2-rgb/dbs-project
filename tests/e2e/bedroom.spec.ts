import { expect, test, type Page } from "@playwright/test";
import { BATTERY_PACK_DEFINITIONS } from "../../src/lib/batteryPacks";

async function expectStartOverlaySpacing(page: Page) {
  const intakeBounds = await page.locator(".start-intake").boundingBox();
  const buttonBounds = await page.getByRole("button", { name: "Open your eyes" }).boundingBox();
  expect(intakeBounds).not.toBeNull();
  expect(buttonBounds).not.toBeNull();
  if (intakeBounds && buttonBounds) {
    expect(buttonBounds.y).toBeGreaterThanOrEqual(intakeBounds.y + intakeBounds.height);
  }
}

async function waitForIntroToSettle(page: Page) {
  await expect(page.locator(".start-overlay")).toBeHidden({ timeout: 20_000 });
}

async function waitForE2EControls(page: Page) {
  await expect(page.locator(".e2e-gameplay-controls")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".e2e-pack-controls")).toBeVisible({ timeout: 20_000 });
}

async function clickE2EButton(page: Page, label: string) {
  const button = page.locator("button", { hasText: label }).first();
  await button.waitFor({ state: "attached", timeout: 20_000 });
  await button.click({ force: true });
}

async function clickGameplayControl(page: Page, label: string) {
  const button = page.getByRole("button", { name: label });
  await button.waitFor({ state: "attached", timeout: 20_000 });
  await button.click({ force: true });
}

async function dblclickCanvasCenter(page: Page) {
  const canvas = page.locator(".scene-frame canvas").first();
  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) return;

  await canvas.dblclick({
    position: {
      x: bounds.width / 2,
      y: bounds.height / 2,
    },
    force: true,
  });
}

test("renders the fixed bedroom scene", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Hello Clarice/);
  await expect(page.getByTestId("bedroom-canvas")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open your eyes" })).toBeVisible();
  await expectStartOverlaySpacing(page);
  await page.getByRole("button", { name: "Open your eyes" }).click();
  await waitForIntroToSettle(page);
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
  test.setTimeout(60_000);
  await page.goto("/?e2e=1");
  await page.getByRole("button", { name: "Open your eyes" }).click();
  await waitForIntroToSettle(page);
  await waitForE2EControls(page);

  await clickE2EButton(page, "Open phone panel (e2e)");
  await expect(page.getByLabel("Open social feed")).toBeVisible();
  await page.getByLabel("Open social feed").click();
  await expect(page.getByText("For You")).toBeVisible({ timeout: 4_000 });

  await expect(page.locator(".phone-social-blackout")).toBeVisible({ timeout: 22_000 });
  await expect(page.locator(".phone-focus-panel")).toBeHidden({ timeout: 16_000 });
  await expect(page.locator(".look-hint")).toContainText(/use WASD to move/i, { timeout: 6_000 });
  await expect(page.getByText(/what was that\?\?/i)).toBeVisible({ timeout: 4_000 });
});

test("keeps the unlock tutorial overlay visible", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/?e2e=1");
  await page.getByRole("button", { name: "Open your eyes" }).click();
  await waitForIntroToSettle(page);
  await waitForE2EControls(page);

  await clickGameplayControl(page, "Set unlock");
  await expect(page.locator(".phone-focus-slider-label")).toHaveText("slide to unlock", { timeout: 5_000 });
});

test("keeps the scroll tutorial overlay visible", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/?e2e=1");
  await page.getByRole("button", { name: "Open your eyes" }).click();
  await waitForIntroToSettle(page);
  await waitForE2EControls(page);

  await clickE2EButton(page, "Open phone panel (e2e)");
  await expect(page.locator(".phone-focus-panel")).toBeVisible({ timeout: 5_000 });
  await page.getByLabel("Open social feed").click();
  await expect(page.locator(".phone-social")).toBeVisible({ timeout: 5_000 });
  await expect(page.locator(".phone-social-hint")).toBeVisible({ timeout: 5_000 });
  await expect(page.locator(".phone-social-hint")).toContainText(/scroll to browse/i);
});

test("skip intro lets player pick up phone instead of opening panel", async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto("/?e2e=1");
  await page.getByRole("button", { name: "Skip intro" }).click();
  await waitForE2EControls(page);

  await clickE2EButton(page, "Interact phone prop (e2e)");
  await expect(page.locator(".post-phone-dialogue")).toContainText(/I should take my phone with me just in case/i, {
    timeout: 5_000,
  });
  await expect(page.getByText("press o to open phone")).toBeVisible({ timeout: 3_000 });
  await expect(page.locator(".phone-focus-panel")).toBeHidden();
  await expect(page.getByText("Click and drag to look around")).toHaveCount(0);
});

test("directives do not overlap and keep spacing from phone panel", async ({ page }) => {
  test.setTimeout(70_000);
  await page.goto("/?e2e=1");
  await page.getByRole("button", { name: "Open your eyes" }).click();
  await waitForIntroToSettle(page);
  await waitForE2EControls(page);

  await clickE2EButton(page, "Open phone panel (e2e)");
  await expect(page.locator(".phone-focus-panel")).toBeVisible({ timeout: 4_000 });
  await page.locator(".phone-focus-overlay").click({ position: { x: 20, y: 600 } });
  await expect(page.locator(".phone-focus-panel")).toBeHidden({ timeout: 4_000 });

  await expect(page.getByText(/what was that\?\?/i)).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText(/I should take my phone with me just in case/i)).toHaveCount(0);

  await page.waitForTimeout(7600);
  await expect(page.getByText(/I should take my phone with me just in case/i)).toBeVisible({ timeout: 4_000 });

  const dialogueCount = await page.getByText(/I should take my phone with me just in case/i).count();
  expect(dialogueCount).toBe(1);

  await clickE2EButton(page, "Collect phone (e2e)");

  await expect(page.getByText("press o to open phone")).toBeVisible({ timeout: 3_000 });
  await page.keyboard.press("o");
  await expect(page.locator(".phone-focus-panel")).toBeVisible({ timeout: 4_000 });
  const closeHint = page.locator(".phone-close-hint").first();
  await expect(closeHint).toBeVisible({ timeout: 4_000 });
});

test("validates gameplay state transitions and overlays", async ({ page }) => {
  test.setTimeout(70_000);
  await page.goto("/?e2e=1");
  await page.getByRole("button", { name: "Open your eyes" }).click();
  await waitForIntroToSettle(page);
  await waitForE2EControls(page);

  await clickGameplayControl(page, "Set exploring");
  await expect(page.locator(".gameplay-state-label")).toHaveText("[exploring]");

  await clickGameplayControl(page, "Set warning");
  await expect(page.locator(".gameplay-state-label")).toHaveText("[defense]");
  await expect(page.locator(".gameplay-overlay-warning")).toBeVisible();

  await clickGameplayControl(page, "Set unlock");
  await expect(page.locator(".gameplay-state-label")).toHaveText("[defense]");
  await expect(page.locator(".phone-focus-panel")).toBeVisible();
  await expect(page.locator(".phone-defense-badge")).toBeVisible();

  await clickGameplayControl(page, "Set attack");
  await expect(page.locator(".gameplay-state-label")).toHaveText("[attack]");
  await expect(page.locator(".gameplay-overlay-attack")).toBeVisible();

  await clickGameplayControl(page, "Set success");
  await expect(page.locator(".gameplay-state-label")).toHaveText("[defense successful]");
  await expect(page.locator(".gameplay-overlay-success")).toBeVisible();

  await clickGameplayControl(page, "Set win");
  await expect(page.locator(".gameplay-state-label")).toHaveText("[day complete]");
  await page.waitForTimeout(200);
  await expect(page.locator(".gameplay-finish-card")).toBeVisible({ timeout: 6_000 });
  await expect(page.locator(".gameplay-finish-title")).toHaveText("day complete");
  await expect(page.locator(".gameplay-restart-button")).toBeVisible();
});

test("validates the game over finish state", async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto("/?e2e=1");
  await page.getByRole("button", { name: "Open your eyes" }).click();
  await waitForIntroToSettle(page);
  await waitForE2EControls(page);

  await clickGameplayControl(page, "Set lose");
  await expect(page.locator(".gameplay-state-label")).toHaveText("[game over]");
  await expect(page.getByText("The monster broke through your last life.")).toBeVisible();
  await expect(page.getByRole("button", { name: "restart" })).toBeVisible();
});

test("collects every battery pack from a direct front focus", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/?e2e=1");
  await page.getByRole("button", { name: "Open your eyes" }).click();
  await waitForIntroToSettle(page);
  await waitForE2EControls(page);

  await page.getByRole("button", { name: "Enable battery packs (e2e)" }).click({ force: true });
  await expect(page.getByTestId("packs-chip")).toHaveText("packs 0/6", { timeout: 5_000 });

  for (const [index, pack] of BATTERY_PACK_DEFINITIONS.entries()) {
    await page.getByRole("button", { name: `Focus ${pack.id}` }).click({ force: true });
    await page.waitForTimeout(150);
    await dblclickCanvasCenter(page);
    await expect(page.getByTestId("packs-chip")).toHaveText(`packs ${index + 1}/6`, { timeout: 5_000 });
  }

  await expect(page.locator(".gameplay-state-label")).toHaveText("[day complete]", { timeout: 10_000 });
  await expect(page.locator(".gameplay-finish-card")).toBeVisible({ timeout: 10_000 });
});
