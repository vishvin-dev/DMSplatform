// server.js
import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import { execFile } from "child_process";
import { fileURLToPath } from "url";

import config from "./config/scannerConfig.js";
import scannerRoutes from "./routes/scannerRoutes.js";
import { initWatcher } from "./watcher.js";

// Node.js ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({ origin: config.socketCorsOrigin }));

// Static serve processed files (images/PDFs) for preview
app.use("/processed", express.static(config.outputDir));

// REST API routes
app.use("/scan-service", scannerRoutes);

// Optional: check NAPS2 connectivity
execFile(
  config.naps2Path,
  ["--driver", "twain", "--listdevices"],
  (error, stdout, stderr) => {
    if (error) {
      console.error("Could not connect to NAPS2/TWAIN:", stderr);
    } else {
      console.log("NAPS2 connected to TWAIN driver.");
      console.log("Available scanners:\n" + stdout);
    }
  }
);

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Scanner API running at http://localhost:${PORT}`);
});

// Start Socket.IO + Chokidar watcher
initWatcher(server);
