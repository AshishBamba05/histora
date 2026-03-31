import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db.js";
import Event from "./models/Event.js";

const app = express();
app.use(cors());
app.use(express.json());

await connectDB(process.env.MONGODB_URI);

try {
  await Event.syncIndexes();
} catch (e) {
  console.error("Index sync failed:", e);
}

const tokenize = (s) =>
  String(s || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);

const levenshtein = (a, b) => {
  a = a || "";
  b = b || "";
  const n = a.length;
  const m = b.length;
  if (!n) return m;
  if (!m) return n;

  const dp = new Array(m + 1);
  for (let j = 0; j <= m; j++) dp[j] = j;

  for (let i = 1; i <= n; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= m; j++) {
      const tmp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[m];
};

let lexicon = [];

const rebuildLexicon = async () => {
  const kws = await Event.distinct("keywords");
  const titles = await Event.find({}, { title: 1 }).lean();

  const set = new Set();
  for (const k of kws) if (k) set.add(String(k).toLowerCase());
  for (const t of titles) {
    for (const w of tokenize(t?.title)) set.add(w);
  }

  lexicon = Array.from(set);
};

await rebuildLexicon();

app.get("/api/events", async (req, res) => {
  const { kind } = req.query;
  const filter = kind ? { kind } : {};
  const events = await Event.find(filter).sort({ date: 1, start: 1 }).lean();
  res.json(events);
});

const bestSuggestion = (q) => {
  const needle = String(q || "").toLowerCase().trim();
  if (!needle) return null;
  if (needle.length < 3) return null;

  let best = null;
  let bestScore = Infinity;

  for (const term of lexicon) {
    if (!term) continue;

    if (needle.length >= 3 && term.includes(needle)) return term;

    const d = levenshtein(needle, term);
    if (d < bestScore) {
      bestScore = d;
      best = term;
    }
  }

  const maxDist = Math.max(2, Math.floor(needle.length * 0.35));
  return bestScore <= maxDist ? best : null;
};

app.get("/api/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ results: [], suggestion: null });

    const results = await Event.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(50)
      .lean();

    if (results.length) return res.json({ results, suggestion: null });

    const suggestion = bestSuggestion(q);
    res.json({ results: [], suggestion });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ results: [], suggestion: null, error: String(err?.message || err) });
  }
});

const port = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../dist")));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(port, () => console.log(`Server on ${port}`));
