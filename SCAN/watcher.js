// =====================
// watcher.js
// =====================
import chokidar from "chokidar";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import config from "./config/scannerConfig.js";
import { Server } from "socket.io";

let io;

// --- Wait until file size stops changing ---
export async function waitForStableFile(filePath) {
  const { pollMs, attempts } = config.fileStabilityCheck;
  let lastSize = -1;
  for (let i = 0; i < attempts; i++) {
    if (!fs.existsSync(filePath)) {
      await new Promise((r) => setTimeout(r, pollMs));
      continue;
    }
    const { size } = fs.statSync(filePath);
    if (size === lastSize && size > 0) return true;
    lastSize = size;
    await new Promise((r) => setTimeout(r, pollMs));
  }
  return false;
}

// --- Preprocess: noise removal, threshold, rotation ---
export async function preprocessImage(inputPath, outputPath) {
  await sharp(inputPath)
    .rotate(.1)
    // .grayscale()
    .linear(1.0, -10)
    // .threshold(170)
    .toFile(outputPath);
  return outputPath;
}

// --- Compress image ---
export async function compressImage(inputPath, outputPath) {
  await sharp(inputPath)
    .resize({ width: 1500 })
    .jpeg({ quality: 75 })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  return { outputPath, width: meta.width, height: meta.height };
}

// --- Image → Encrypted PDF ---
export async function imageToEncryptedPDF(compressedPath, pdfPath, width, height) {
  const pdfDoc = await PDFDocument.create();
  const imgBytes = fs.readFileSync(compressedPath);
  const image = await pdfDoc.embedJpg(imgBytes);

  const page = pdfDoc.addPage([width, height]);
  page.drawImage(image, { x: 0, y: 0, width, height });

  const encryptedPdfBytes = await pdfDoc.save({
    useObjectStreams: false,
    password: "secret123",
  });
  fs.writeFileSync(pdfPath, encryptedPdfBytes);
  return pdfPath;
}

// --- Handle single image file ---
export async function processFile(filePath) {
  const fileName = path.basename(filePath);
  const base = fileName.replace(path.extname(fileName), "");
  const tmpPre = path.join(config.outputDir, `${base}-pre.jpg`);
  const tmpCompressed = path.join(config.outputDir, `${base}-compressed.jpg`);
  const finalPdf = path.join(config.outputDir, `${base}-processed.pdf`);

  try {
    console.log(`Processing image: ${fileName}`);
    await preprocessImage(filePath, tmpPre);
    const { outputPath: compressedPath, width, height } = await compressImage(tmpPre, tmpCompressed);
    await imageToEncryptedPDF(compressedPath, finalPdf, width, height);

    io.emit("new-scan-processed", {
      fileName: path.basename(finalPdf),
      imageUrl: `/processed/${path.basename(tmpCompressed)}`, // preview image
      pdfUrl: `/processed/${path.basename(finalPdf)}`,        // encrypted PDF
      imageWidth: width,
      imageHeight: height,
    });

    console.log(`Processed & emitted ${finalPdf}`);
  } catch (err) {
    console.error("Image processing error:", err);
  }
}

// --- Handle PDF file (encrypt only) ---
export async function processPdf(filePath) {
  const fileName = path.basename(filePath);
  const finalPdf = path.join(config.outputDir, fileName.replace(".pdf", "-encrypted.pdf"));

  try {
    console.log(`Processing PDF: ${fileName}`);
    const pdfDoc = await PDFDocument.load(fs.readFileSync(filePath));
    const encryptedPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      password: "secret123",
    });
    fs.writeFileSync(finalPdf, encryptedPdfBytes);

    io.emit("new-scan-processed", {
      fileName: path.basename(finalPdf),
      pdfUrl: `/processed/${path.basename(finalPdf)}`,
    });

    console.log(`Processed & emitted encrypted PDF: ${finalPdf}`);
  } catch (err) {
    console.error("PDF processing error:", err);
  }
}

// --- File type detection ---
export function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp"].includes(ext)) return "image";
  if (ext === ".pdf") return "pdf";
  return "other";
}

// --- Init watcher + socket ---
export function initWatcher(server) {
  io = new Server(server, {
    cors: { origin: config.socketCorsOrigin, methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
  });

  const watcher = chokidar.watch(config.outputDir, {
    persistent: true,
    ignoreInitial: true,
    usePolling: true,
    interval: 1000,
    ignored: /(-compressed\.jpg$|-pre\.jpg$|-processed\.pdf$|-encrypted\.pdf$)/,
  });

  watcher.on("add", async (filePath) => {
    console.log("New scan detected:", filePath);
    const ok = await waitForStableFile(filePath);
    if (!ok) {
      console.warn("File never stabilized, skipping:", filePath);
      return;
    }

    const type = getFileType(filePath);
    if (type === "image") {
      await processFile(filePath);
    } else if (type === "pdf") {
      await processPdf(filePath);
    } else {
      console.log("Ignored unsupported file:", filePath);
    }
  });

  console.log("Watching folder:", config.outputDir);
}
