import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 4010);
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";
const DEMO_USER = process.env.DEMO_USER || "demo";
const DEMO_PASS = process.env.DEMO_PASS || "demo";

const DATA_DIR = path.join(__dirname, "..", "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readStateFile() {
  try {
    const raw = await fs.readFile(STATE_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeStateFile(stateByUser) {
  await ensureDataDir();
  await fs.writeFile(STATE_FILE, JSON.stringify(stateByUser, null, 2), "utf8");
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username !== DEMO_USER || password !== DEMO_PASS) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const token = jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: "12h" });
  return res.json({ token, tokenType: "Bearer", expiresIn: 12 * 60 * 60 });
});

function requireAuth(req, res, next) {
  const header = req.header("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ error: "missing_bearer_token" });
  }

  try {
    const payload = jwt.verify(match[1], JWT_SECRET);
    req.user = { sub: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}

app.get("/api/state", requireAuth, async (req, res) => {
  const stateByUser = await readStateFile();
  const state = stateByUser?.[req.user.sub] ?? null;
  res.json({ state });
});

app.put("/api/state", requireAuth, async (req, res) => {
  const { state } = req.body || {};
  if (!state || typeof state !== "object") {
    return res.status(400).json({ error: "state_required" });
  }

  const stateByUser = await readStateFile();
  stateByUser[req.user.sub] = state;
  await writeStateFile(stateByUser);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Dental backend listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Demo login: ${DEMO_USER}/${DEMO_PASS}`);
});
