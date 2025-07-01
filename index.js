const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const COOKIES = process.env.F2F_COOKIES;
const USERNAME = "littleangel1x"; // jouw gebruikersnaam

const HEADERS = {
  "Cookie": COOKIES,
  "User-Agent": "Mozilla/5.0",
};

const COMMENTS = [
  "Wauw knapp🥰",
  "mooi 🥵",
  "lekkerdingg🙈",
  "sexyy zeg",
  "oh wauw 🥵",
];

// ➤ Explore ophalen
async function fetchExplore() {
  const res = await axios.get('https://api.friends2follow.me/posts/explore', {
    headers: HEADERS,
  });
  return res.data;
}

// ➤ Reactie plaatsen
async function commentOnPosts() {
  try {
    const posts = await fetchExplore();

    if (!Array.isArray(posts)) {
      console.error("❌ Unexpected post format:", posts);
      return;
    }

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
        await axios.post(`https://api.friends2follow.me/posts/${id}/comment`, {
          content: comment,
        }, {
          headers: HEADERS,
        });

        console.log(`😇 Reactie geplaatst op post ${id}: "${comment}"`);
        reactedIds.add(id);
      } catch (err) {
        console.error(`⚠️ Fout bij reageren op post ${id}:`, err?.response?.status || err?.message);
      }
    }
  } catch (err) {
    console.error("❌ Fout bij ophalen van explore posts:", err?.response?.status || err?.message);
  }
}

// ➤ Start de server + run direct + elke 30 min
app.get('/', (req, res) => {
  res.send('LittleAngel bot is running! 😇');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  commentOnPosts(); // direct bij opstarten
  setInterval(commentOnPosts, 1000 * 60 * 30); // elke 30 minuten
});
// start meteen bij opstarten (voor debuggen en direct testen)
start();

// optioneel: hou alive met express (nodig voor sommige platforms)
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is running...'));
app.listen(process.env.PORT || 3000, () => {
  console.log('✅ Express server draait');
});
