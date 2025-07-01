process.env.PLAYWRIGHT_BROWSERS_PATH = '0';
const { chromium } = require('playwright');
require('dotenv').config();

const COOKIES = JSON.parse(process.env.F2F_COOKIES || '[]');
const COMMENTS = [
  "Wauw knapp🥰",
  "mooi 🥵",
  "lekkerdingg🙈",
  "sexyy zeg",
  "oh wauw 🥵"
];

const USERNAME = process.env.F2F_USERNAME || "littleangel1x";

async function runBot() {
  console.log("🔁 Bot gestart...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Voeg cookies toe
  await context.addCookies(COOKIES);

  const page = await context.newPage();
  await page.goto('https://www.friends2follow.me/explore', { waitUntil: 'networkidle' });

  // Wacht op posts
  await page.waitForTimeout(5000);

  const posts = await page.$$('[data-testid="post-link"]');
  const ownUsername = USERNAME.toLowerCase();
  const totalToReact = Math.floor(posts.length * 0.85);
  let reacted = 0;

  for (let i = 0; i < posts.length && reacted < totalToReact; i++) {
    const post = posts[i];
    const postHref = await post.getAttribute('href');
    if (!postHref) continue;

    const username = postHref.split('/')[1];
    if (username.toLowerCase() === ownUsername) continue;

    await page.goto(`https://www.friends2follow.me${postHref}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const alreadyCommented = await page.$(`text=${COMMENTS[0]}`);
    if (alreadyCommented) continue;

    const commentInput = await page.$('textarea');
    const submitBtn = await page.$('button:has-text("Send")');

    if (commentInput && submitBtn) {
      const comment = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];
      await commentInput.fill(comment);
      await submitBtn.click();
      console.log(`💬 Gereageerd op ${postHref}: "${comment}"`);
      reacted++;
      await page.waitForTimeout(3000);
    }
  }

  console.log("✅ Reactie-ronde voltooid!");
  await browser.close();
}

// Draai elke 30 minuten
runBot();
setInterval(runBot, 1000 * 60 * 30);
