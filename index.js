const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// === CONFIG ===
const USERNAME = "littleangel1x"; // Gebruikersnaam van het model

const COOKIES = process.env.F2F_COOKIES;
const HEADERS = {
  "Cookie": COOKIES,
  "User-Agent": "Mozilla/5.0",
};

const COMMENTS = [
  "Wauw knapp🥰",
  "mooi 🥵",
  "lekkerdingg🙈",
  "sexyy zeg",
  "oh wauw 🥵"
];

const BASE_URL = "https://www.friends2follow.com/api";
const EXPLORE_URL = `${BASE_URL}/posts/explore/`;
const COMMENT_URL = (postId) => `${BASE_URL}/posts/${postId}/comment/`;

// === CORE FUNCTION ===
async function runBot() {
  console.log("🔁 Bot start check...");

  try {
    const res = await axios.get(EXPLORE_URL, { headers: HEADERS });
    const posts = res.data?.posts || [];

    if (!Array.isArray(posts)) {
      console.error("❌ Unexpected post format:", posts);
      return;
    }

    // 85% van de nieuwste posts selecteren
    const limit = Math.floor(posts.length * 0.85);
    const selectedPosts = posts.slice(0, limit);

    const reactedIds = new Set();

    for (const post of selectedPosts) {
      const { id, user, has_commented } = post;
      const isOwnPost = user?.username === USERNAME;

      if (has_commented || isOwnPost || reactedIds.has(id)) {
        continue;
      }

      const comment = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];

      try {
        await axios.post(COMMENT_URL(id), { content: comment }, { headers: HEADERS });
        console.log(`💬 Reactie geplaatst op post ${id}: "${comment}"`);
        reactedIds.add(id);
      } catch (err) {
        console.error(`⚠️ Fout bij reageren op post ${id}:`, err?.response?.status || err?.message);
      }
    }
  } catch (err) {
    console.error("❌ Fout bij ophalen van explore posts:", err?.response?.status || err?.message);
  }
}

// Start bot elke 30 minuten
cron.schedule('*/30 * * * *', runBot);

// Init
app.get('/', (req, res) => {
  res.send('LittleAngel bot is running! 😇');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
