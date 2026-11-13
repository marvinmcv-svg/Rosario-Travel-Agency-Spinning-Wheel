/* ──────────────────────────────────────────────────────────────
   End-to-end screen test, desktop + phones.

     npm run build && npm start            # in one terminal
     NVIDIA_API_KEY= npm start             # (recommended: keeps Rosario AI offline)
     npm run e2e                           # in another

   Options (env): E2E_BASE_URL (default http://localhost:3000),
                  E2E_OUT (screenshots folder, default ./e2e-screenshots)
   Needs Playwright with Chromium: `npm i -D playwright && npx playwright install chromium`
   (not a project dependency, so deploys stay light).
   ────────────────────────────────────────────────────────────── */

import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

// require() also finds a globally installed Playwright (NODE_PATH), unlike `import`.
const { chromium, devices } = createRequire(import.meta.url)("playwright");

const BASE = (process.env.E2E_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const OUT = process.env.E2E_OUT || "e2e-screenshots";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", opts: { viewport: { width: 1440, height: 900 } } },
  { name: "laptop", opts: { viewport: { width: 1024, height: 700 } } },
  { name: "iphone-13", opts: { ...devices["iPhone 13"] } },
  { name: "pixel-7", opts: { ...devices["Pixel 7"] } },
  { name: "iphone-se", opts: { ...devices["iPhone SE"] } },
];

const PAGES = [
  "/",
  "/journeys",
  "/journeys/rosario-altiplano",
  "/journeys/copacabana-escape",
  "/journeys/patagonia-wild",
  "/stays",
  "/destinations",
  "/destinations/salar-de-uyuni",
  "/adventures",
  "/about",
  "/contact",
  "/essentials",
  "/payments",
  "/stories",
  "/es",
  "/es/stays",
  "/es/journeys/copacabana-escape",
  "/zh/stays",
];

/* Noise that is not ours: Vercel Analytics only exists on Vercel. */
const IGNORE = [/_vercel\/insights/, /favicon/];

const results = [];
let current = "";
async function check(name, fn) {
  const label = `${current} › ${name}`;
  try {
    await fn();
    results.push({ label, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (e) {
    results.push({ label, ok: false, err: e.message.split("\n")[0] });
    console.log(`  ✗ ${name}\n      ${e.message.split("\n")[0]}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function watch(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    // "Failed to load resource" has no URL in its text; failed requests are reported (with URL) below.
    if (m.type() === "error" && !/Failed to load resource/.test(m.text()) && !IGNORE.some((r) => r.test(m.text()))) errors.push(`console: ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && r.url().startsWith(BASE) && !IGNORE.some((x) => x.test(r.url()))) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}

/** Scroll the whole page so lazy images and scroll scenes load, then come back. */
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 300));
  });
}

async function brokenImages(page) {
  await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
  return page.evaluate(() =>
    Array.from(document.images)
      .filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src"))
      .map((i) => i.currentSrc || i.src),
  );
}

async function overflowX(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const over = document.documentElement.scrollWidth - vw;
    if (over <= 1) return null;
    // Name the widest culprit to make the failure actionable.
    let worst = null;
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && getComputedStyle(el).position !== "fixed") {
        if (!worst || r.right > worst.r) worst = { r: r.right, d: `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}` };
      }
    }
    return `${over}px wider than the screen${worst ? ` (e.g. ${worst.d})` : ""}`;
  });
}

const skipIntro = () => {
  try {
    sessionStorage.setItem("rosario.intro.seen", "1");
  } catch {}
};

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  console.log(`\n■ ${vp.name}`);
  const mobile = !!vp.opts.isMobile;

  /* ── 1. The loading intro ─────────────────────────────────── */
  current = `${vp.name} intro`;
  {
    const ctx = await browser.newContext(vp.opts);
    const page = await ctx.newPage();
    const errors = watch(page);
    const t0 = Date.now();
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await check("intro is shown with the Rosario mark and loading %", async () => {
      await page.locator("[data-preloader]").waitFor({ state: "visible", timeout: 5000 });
      assert((await page.locator("[data-preloader] [data-mark-q]").count()) === 4, "mark should have 4 quadrants");
      await page.waitForTimeout(2400);
      await page.screenshot({ path: join(OUT, `${vp.name}-intro-weave.png`) });
      const pct = await page.locator("[data-preloader] .tabular-nums span").first().textContent({ timeout: 1000 });
      assert(/^\d{2,3}$/.test(pct.trim()), `odd percentage "${pct}"`);
    });
    await check("intro shows the ROSARIO TRAVELS lockup", async () => {
      await page.waitForTimeout(1300);
      await page.screenshot({ path: join(OUT, `${vp.name}-intro-logo.png`) });
      const word = await page.locator("[data-pl-letter]").allTextContents();
      assert(word.join("") === "Rosario", `lockup letters were "${word.join("")}"`);
    });
    await check("intro hands over to the hero in under 9 s", async () => {
      await page.locator("[data-preloader]").waitFor({ state: "detached", timeout: 9000 - (Date.now() - t0) });
      await page.waitForTimeout(1600);
      assert(await page.locator("[data-hero-brand] svg").first().isVisible(), "hero logo not visible");
      await page.screenshot({ path: join(OUT, `${vp.name}-hero.png`) });
    });
    await check("intro plays once per session", async () => {
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(800);
      assert((await page.locator("[data-preloader]").count()) === 0, "preloader shown again after reload");
    });
    await check("no errors during the intro", async () => {
      assert(errors.length === 0, errors.slice(0, 3).join(" | "));
    });
    await ctx.close();
  }
  {
    const ctx = await browser.newContext(vp.opts);
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await check("“Skip intro” skips straight to the site", async () => {
      await page.locator("[data-preloader]").waitFor({ state: "visible" });
      await page.waitForTimeout(700);
      await page.getByRole("button", { name: /skip intro/i }).click();
      await page.locator("[data-preloader]").waitFor({ state: "detached", timeout: 3000 });
    });
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({ ...vp.opts, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await check("reduced motion: still logo, then fades away", async () => {
      await page.locator("[data-preloader]").waitFor({ state: "detached", timeout: 9000 });
    });
    await ctx.close();
  }

  /* ── 2. Every page: loads, no errors, no broken images, no sideways scroll ── */
  const ctx = await browser.newContext(vp.opts);
  await ctx.addInitScript(skipIntro);
  const page = await ctx.newPage();
  for (const path of PAGES) {
    current = `${vp.name} ${path}`;
    const errors = watch(page);
    const res = await page.goto(BASE + path, { waitUntil: "load" });
    await page.waitForTimeout(600);
    await check(`loads (${res?.status()})`, async () => assert(res && res.ok(), `HTTP ${res?.status()}`));
    await check("has a visible h1", async () => assert(await page.locator("h1").first().isVisible(), "no visible h1"));
    await scrollThrough(page);
    await check("no broken images", async () => {
      const bad = await brokenImages(page);
      assert(bad.length === 0, bad.slice(0, 3).join(", "));
    });
    await check("no horizontal scrolling", async () => {
      const o = await overflowX(page);
      assert(!o, o);
    });
    await check("no console errors or failed requests", async () => assert(errors.length === 0, errors.slice(0, 3).join(" | ")));
    page.removeAllListeners("console");
    page.removeAllListeners("pageerror");
    page.removeAllListeners("response");
    if (["/", "/stays", "/journeys/rosario-altiplano", "/about", "/es/stays"].includes(path)) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(900);
      await page.screenshot({ path: join(OUT, `${vp.name}${path.replace(/\//g, "_") || "_home"}.png`) });
    }
  }

  /* ── 3. Brand, company info and hotels ─────────────────────── */
  current = `${vp.name} brand & hotels`;
  await page.goto(BASE + "/stays", { waitUntil: "load" });
  await check("/stays lists the four Hoteles Rosario with phone and booking links", async () => {
    const hotels = page.locator('[data-testid="hotel"]');
    assert((await hotels.count()) === 4, `found ${await hotels.count()} hotels`);
    for (let i = 0; i < 4; i++) {
      const h = hotels.nth(i);
      assert((await h.locator('a[href^="tel:+591"]').count()) >= 1, `hotel ${i + 1} has no phone link`);
      const wa = await h.locator('a[href*="wa.me"]').first().getAttribute("href");
      const name = (await h.locator("h3").textContent()).trim();
      assert(wa && decodeURIComponent(wa).includes(name), `WhatsApp message for ${name} does not name the hotel`);
      assert((await h.locator('a[href*="gruporosario.com"]').count()) === 1, `${name} has no official-site link`);
    }
  });
  await check("/stays shows the real Hoteles Rosario logo", async () => {
    const ok = await page.locator('img[src="/brand/hoteles-rosario-inverted.png"]').first().evaluate((i) => i.complete && i.naturalWidth > 0);
    assert(ok, "logo image missing");
  });
  await check("/stays offers journeys combined with hotel nights", async () => {
    const cards = page.locator('#combos [data-testid="stay-journey"]');
    assert((await cards.count()) >= 4, `only ${await cards.count()} combined trips`);
    const first = await cards.first().getAttribute("href");
    assert(first?.startsWith("/journeys/"), `combo links to ${first}`);
  });
  await check("hotel anchor links land on the hotel", async () => {
    await page.goto(BASE + "/stays#rosario-uyuni", { waitUntil: "load" });
    await page.waitForTimeout(800);
    const top = await page.locator("#rosario-uyuni").evaluate((e) => e.getBoundingClientRect().top);
    assert(top > -200 && top < 700, `#rosario-uyuni is at ${Math.round(top)}px`);
  });

  await page.goto(BASE + "/journeys/rosario-altiplano", { waitUntil: "load" });
  await check("journey page says where you sleep (3 Rosario hotels)", async () => {
    const box = page.locator('[data-testid="where-you-sleep"]');
    await box.scrollIntoViewIfNeeded();
    assert((await box.locator('a[href^="/stays#"]').count()) === 3, "expected 3 hotels");
    assert(/2 nights/.test(await box.textContent()), "nights not shown");
  });
  await check("journey without hotel nights has no ‘where you sleep’", async () => {
    await page.goto(BASE + "/journeys/patagonia-wild", { waitUntil: "load" });
    assert((await page.locator('[data-testid="where-you-sleep"]').count()) === 0, "unexpected section");
  });
  await check("booking a combined trip works end to end", async () => {
    await page.goto(BASE + "/journeys/copacabana-escape", { waitUntil: "load" });
    const cont = page.getByRole("button", { name: "Continue" });
    await cont.scrollIntoViewIfNeeded();
    await cont.click();
    await page.getByLabel("Full name").fill("E2E Tester");
    await page.getByLabel("Email", { exact: true }).fill("e2e@example.com");
    await page.getByRole("button", { name: "Request this journey" }).click();
    await page.getByText(/RB-[A-Z0-9]{4,}/).first().waitFor({ timeout: 8000 });
    const links = await page.locator('a[href*="wa.me"]').evaluateAll((as) => as.map((a) => decodeURIComponent(a.getAttribute("href") || "")));
    assert(links.some((h) => h.includes("Copacabana Lake Escape") && /RB-/.test(h)), "WhatsApp hand-off is missing the journey and reference");
    await page.screenshot({ path: join(OUT, `${vp.name}-booking-done.png`) });
  });

  await page.goto(BASE + "/", { waitUntil: "load" });
  await check("home page has the Hoteles Rosario section with combined trips", async () => {
    const s = page.locator('[data-testid="home-stays"]');
    await s.scrollIntoViewIfNeeded();
    assert((await s.locator('a[href^="/stays#"]').count()) >= 3, "hotel cards missing");
    assert((await s.locator('[data-testid="stay-journey"]').count()) === 4, "combined trips missing");
    await page.waitForTimeout(1200);
    await s.screenshot({ path: join(OUT, `${vp.name}-home-stays.png`) });
  });
  await check("footer: Grupo Rosario block with hotels, reservations and Instagram", async () => {
    const f = page.locator("footer");
    assert((await f.locator('a[href*="gruporosario.com"]').count()) >= 5, "hotel links missing");
    assert((await f.locator('a[href="mailto:reservas@gruporosario.travel"]').count()) === 1, "reservations email missing");
    assert((await f.locator('a[href*="instagram.com/hotelesrosariobolivia"]').count()) === 1, "Instagram missing");
  });
  await check("nav logo is the Rosario mark and the menu links to Hotels & stays", async () => {
    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForTimeout(700);
    await page.evaluate(() => window.scrollBy(0, -200)); // the bar reappears on scroll up
    await page.waitForTimeout(900);
    assert(await page.locator("header nav a svg").first().isVisible(), "nav mark not visible");
    await page.getByRole("button", { name: /open menu/i }).click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT, `${vp.name}-menu.png`) });
    const link = page.locator('[data-menu-link][href="/stays"]');
    assert(await link.isVisible(), "Hotels & stays not in the menu");
    await link.click();
    await page.waitForURL(/\/stays$/, { timeout: 8000 });
  });
  await check("about page tells the Grupo Rosario story", async () => {
    await page.goto(BASE + "/about", { waitUntil: "load" });
    const s = page.locator('[data-testid="about-group"]');
    await s.scrollIntoViewIfNeeded();
    assert(/Grupo Rosario/.test(await s.textContent()), "group text missing");
  });
  await check("Spanish: hotels page and combined trip are translated", async () => {
    await page.goto(BASE + "/es/stays", { waitUntil: "load" });
    assert(/Descansa con nosotros/.test(await page.locator("h1").textContent()), "title not Spanish");
    await page.goto(BASE + "/es/journeys/copacabana-escape", { waitUntil: "load" });
    assert(/Escapada al Lago/.test(await page.locator("h1").textContent()), "journey not Spanish");
    assert(/Dónde dormirás/.test(await page.locator('[data-testid="where-you-sleep"]').textContent()), "where you sleep not Spanish");
  });
  await check("Portuguese, French, German, Chinese: the new trips and hotel booking are translated", async () => {
    for (const [l, title] of [["pt", "O Altiplano Rosario"], ["fr", "L'Altiplano Rosario"], ["de", "Das Rosario-Altiplano"], ["zh", "Rosario 高原之旅"]]) {
      await page.goto(`${BASE}/${l}/journeys/rosario-altiplano`, { waitUntil: "load" });
      const h1 = (await page.locator("h1").textContent()).trim();
      assert(h1.includes(title), `${l}: title was "${h1}"`);
    }
    await page.goto(BASE + "/fr/stays", { waitUntil: "load" });
    assert(/Réservez votre chambre/.test(await page.locator('[data-testid="stay-booker"]').textContent()), "French booker not translated");
  });

  /* ── 4. Hotel room booking + WhatsApp ordering ─────────────── */
  current = `${vp.name} hotel booking`;
  let waMessage = "";
  await check("book a room: hotel from link, live price, extras, WhatsApp hand-off", async () => {
    await ctx.route(/https:\/\/(wa\.me|api\.whatsapp\.com)\//, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<title>WhatsApp</title>" }));
    await page.goto(BASE + "/stays#book-rosario-uyuni", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    assert((await page.locator('[data-testid="pick-rosario-uyuni"]').getAttribute("aria-checked")) === "true", "#book-rosario-uyuni did not pick Uyuni");
    // 2 guests: the single room is too small, so the king room is chosen (2 nights × $110)
    assert((await page.locator('[data-testid="room-uy-king"]').getAttribute("aria-checked")) === "true", "king room not selected");
    assert(await page.locator('[data-testid="room-uy-single"]').isDisabled(), "single room should be too small for 2 guests");
    const sum = page.locator('[data-testid="stay-summary"]');
    assert(/\$220/.test(await sum.textContent()), `room total wrong: ${await sum.textContent()}`);
    await page.locator('[data-testid="extra-salar"]').check();
    assert(/\$340/.test(await sum.textContent()), "extras not added to the total (220 + 2 × 60)");
    const b = page.locator('[data-testid="stay-booker"]');
    await b.getByPlaceholder("Full name").fill("E2E Guest");
    await b.getByPlaceholder("Email", { exact: true }).fill("guest@example.com");
    await b.getByPlaceholder("WhatsApp number").fill("71234567");
    await b.getByPlaceholder("Requests (arrival time, celebrations…)").fill("Late arrival");
    const [popup] = await Promise.all([ctx.waitForEvent("page"), page.locator('[data-testid="stay-book-wa"]').click()]);
    const url = decodeURIComponent(popup.url());
    await popup.close();
    assert(url.includes("wa.me/59177165787") || url.includes("59177165787"), `WhatsApp went to ${url.slice(0, 60)}`);
    assert(/#RS-[A-Z0-9]+ rosario-uyuni\/uy-kingx1 \d{4}-\d{2}-\d{2}>\d{4}-\d{2}-\d{2} 2p \$340 \+salarx1/.test(url), "booking code line missing from the WhatsApp message");
    await page.locator('[data-testid="stay-done"]').waitFor();
    waMessage = await page.locator('[data-testid="stay-message"]').innerText();
    assert(/E2E Guest/.test(waMessage) && /guest@example\.com/.test(waMessage), "guest details missing from the message");
    await page.screenshot({ path: join(OUT, `${vp.name}-stay-done.png`) });
  });
  await check("book a room: impossible stays are blocked", async () => {
    await page.goto(BASE + "/stays#book-rosario-la-paz-centro", { waitUntil: "load" });
    await page.waitForTimeout(800);
    const b = page.locator('[data-testid="stay-booker"]');
    for (let i = 0; i < 2; i++) await b.getByRole("button", { name: "Guests +" }).click(); // 4 guests, 1 room
    assert(await page.locator('[data-testid="room-ce-double"]').isDisabled(), "a double room accepted 4 guests");
    assert(await page.locator('[data-testid="stay-book-wa"]').isDisabled(), "booking allowed with no room that fits");
    await page.locator('[data-testid="check-out"]').fill(await page.locator('[data-testid="check-in"]').inputValue());
    assert(/after check-in/.test(await b.textContent()), "same-day check-out not flagged");
  });

  /* ── 5. Team portal: hotel stays ───────────────────────────── */
  current = `${vp.name} portal`;
  await check("portal: sign in, the website's stay request is listed", async () => {
    await page.goto(BASE + "/admin/stays", { waitUntil: "load" });
    await page.locator('input[type="password"]').fill("rosario");
    await page.getByRole("button", { name: "Enter" }).click();
    await page.locator('[data-testid="stays-table"]').waitFor({ timeout: 8000 });
    assert((await page.locator('[data-testid="stays-table"]').getByText("E2E Guest").count()) >= 1, "website booking missing from the portal");
    await page.screenshot({ path: join(OUT, `${vp.name}-admin-stays.png`) });
  });
  await check("portal: import a booking from its WhatsApp message", async () => {
    page.once("dialog", (d) => d.accept()); // "already in the portal: replace?"
    await page.locator('[data-testid="open-import"]').click();
    await page.locator('[data-testid="import-text"]').fill(waMessage.replace("E2E Guest", "E2E Guest Imported"));
    await page.locator('[data-testid="import-read"]').click();
    await page.locator('[data-testid="stay-save"]').click();
    await page.getByText("E2E Guest Imported").first().waitFor({ timeout: 4000 });
  });
  await check("portal: message the guest on WhatsApp from the reservation", async () => {
    await page.getByText("E2E Guest Imported").first().click();
    const href = decodeURIComponent((await page.locator('[data-testid="wa-confirm"]').getAttribute("href")) || "");
    assert(href.includes("wa.me/59171234567"), `guest link went to ${href.slice(0, 40)} (Bolivian number should get +591)`);
    assert(/confirmada|confirmed/.test(href), "confirmation text missing");
    await page.screenshot({ path: join(OUT, `${vp.name}-admin-drawer.png`) });
    await page.keyboard.press("Escape");
  });
  await check("portal: occupancy calendar and rates", async () => {
    await page.goto(BASE + "/admin/occupancy", { waitUntil: "load" });
    await page.locator('[data-testid="occupancy-grid"]').waitFor();
    await page.goto(BASE + "/admin/hotels", { waitUntil: "load" });
    const rate = page.locator('[data-testid="rate-tt-premium"]');
    await rate.fill("120");
    await rate.blur();
    await page.goto(BASE + "/stays#book-rosario-lago-titicaca", { waitUntil: "load" });
    await page.waitForTimeout(800);
    assert(/\$120/.test(await page.locator('[data-testid="room-tt-premium"]').textContent()), "new rate not shown on the website");
  });

  if (vp === VIEWPORTS[0]) await check("Rosario AI knows our hotels", async () => {
    const r = await page.request.post(BASE + "/api/chat", { data: { messages: [{ role: "user", content: "Which hotel do you recommend in Uyuni?" }], lang: "en" } });
    assert(r.ok(), `chat HTTP ${r.status()}`);
    const text = await r.text();
    assert(/Rosario Uyuni/.test(text), `reply did not mention Hotel Rosario Uyuni: ${text.slice(0, 120)}`);
  });
  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed · screenshots in ${OUT}/`);
if (failed.length) {
  console.log("\nFailed:");
  for (const f of failed) console.log(`  ✗ ${f.label}\n      ${f.err}`);
  process.exit(1);
}
