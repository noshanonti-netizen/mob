import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "50mb" }));

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MEDIA_FILE = path.join(DATA_DIR, "media.json");
const SERVERS_FILE = path.join(DATA_DIR, "servers.json");
const ADS_FILE = path.join(DATA_DIR, "ads.json");

// Helper to safely read files
const readJsonFile = (filePath: string, fallback: any) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
};

// Helper to safely write files
const writeJsonFile = (filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
};

// API Routes
// 1. Custom Media
app.get("/api/custom-media", (req, res) => {
  const media = readJsonFile(MEDIA_FILE, []);
  res.json(media);
});

app.post("/api/custom-media", (req, res) => {
  const media = req.body;
  if (Array.isArray(media)) {
    writeJsonFile(MEDIA_FILE, media);
    res.json({ success: true, count: media.length });
  } else {
    res.status(400).json({ success: false, error: "Invalid data format. Expected array." });
  }
});

// 2. Custom Servers
app.get("/api/custom-servers", (req, res) => {
  const servers = readJsonFile(SERVERS_FILE, {});
  res.json(servers);
});

app.post("/api/custom-servers", (req, res) => {
  const servers = req.body;
  if (servers && typeof servers === "object") {
    writeJsonFile(SERVERS_FILE, servers);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: "Invalid data format. Expected object." });
  }
});

// 3. Ad Settings
app.get("/api/ads", (req, res) => {
  // Return saved ads configuration or default ones
  const defaultAds = {
    // We can define multiple ad slots
    headerAd: {
      type: "script", // "script", "image", "html"
      code: `<div class="w-full flex justify-center items-center py-2 bg-transparent"><div data-cl-spot="2089244"></div></div>`,
      imageUrl: "",
      targetUrl: "",
      isActive: true,
    },
    watchPageAd: {
      type: "script",
      code: `<div class="w-full flex justify-center items-center py-4 bg-transparent"><div data-cl-spot="2089244"></div></div>`,
      imageUrl: "",
      targetUrl: "",
      isActive: true,
    },
    detailsPageAd: {
      type: "script",
      code: `<div class="w-full flex justify-center items-center py-4 bg-transparent"><div data-cl-spot="2089244"></div></div>`,
      imageUrl: "",
      targetUrl: "",
      isActive: true,
    },
    popunderAd: {
      type: "link",
      code: "",
      imageUrl: "",
      targetUrl: "https://urplayer.xyz", // Example popunder target
      isActive: false,
    }
  };
  const ads = readJsonFile(ADS_FILE, defaultAds);
  res.json(ads);
});

app.post("/api/ads", (req, res) => {
  const adsConf = req.body;
  if (adsConf && typeof adsConf === "object") {
    writeJsonFile(ADS_FILE, adsConf);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: "Invalid data format. Expected object." });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Vite Middleware integration for SPA routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
