const axios = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const express = require("express");

dotenv.config();

const COOKIE = process.env.F2F_COOKIE;
const USERNAME = "littleangel1x";
const HEADERS = {
  "cookie": COOKIE,
  "user-agent": "Mozilla/5.0",
  "accept": "text/html",
};

const REACTIONS = [
  "Wauw knapp🥰",
  "mooi 🥵",
  "lekkerdingg🙈",
  "sexyy zeg",
  "oh wauw 🥵",
  "lief 😘",
  "cutiee 🥺",
  "wat een plaatje 🥰",
  "hottttt 🙈"
];

const BASE_URL = "https://www.f2f.com";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchExplorePosts() {
  try {
    const res = await axios.get(`${BASE_URL}/explore`, { headers: HEADERS });
    const $ = cheerio.load(res.data);
    const links = [];

    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.includes("/post/") && !href.includes(USERNAME)) {
        links.push(BASE_URL + href);
      }
    });

    // Uniek maken en 85% selecteren
    const unique = [...new Set(links)];
    const selected = unique.slice(0, Math.floor(unique.length * 0.85));

    return selected;
  } catch (err) {
    console.error("Fout bij ophalen explore:", err.message);
    return [];
  }
}

const reactedPosts = new Set();

async function postReaction(postUrl) {
  try {
    const postIdMatch = postUrl.match(/\/post\/(\d+)/);
    if (!postIdMatch) return;

    const postId = postIdMatch[1];
    if (reactedPosts.has(postId)) return;

    const reaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];

    await axios.post(`${BASE_URL}/api/post/${postId}/comment`, {
      content: reaction,
    }, {
      headers: {
        ...HEADERS,
        "content-type": "application/json"
      }
    });

    console.log(`✅ Gereageerd op post ${postId}: "${reaction}"`);
    reactedPosts.add(postId);
    await delay(3000); // 3 seconden wachten tussen reacties
  } catch (err) {
    console.error("❌ Fout bij reageren:", err.message);
  }
}

async function main() {
  console.log("🔁 Bot gestart...");

  const posts = await fetchExplorePosts();
  for (const post of posts) {
    await postReaction(post);
  }

  console.log("✅ Reactie-ronde voltooid!");
}

// Elke 30 minuten runnen
setInterval(main, 30 * 60 * 1000);
main(); // direct ook starten bij launch

// Nodige Express server voor Render
const app = express();
app.get("/", (_, res) => res.send("Angel-bot actief"));
app.listen(process.env.PORT || 3000);
