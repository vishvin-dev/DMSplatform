// =====================
// controllers/scannerController.js
// =====================
import { execFile } from "child_process";
import config from "../config/scannerConfig.js";
import path from "path";
import fs from "fs";
import { PDFDocument } from "pdf-lib"; // for merging PDFs

// =====================
// List scanners
// =====================
export const listScanners = (req, res) => {
  execFile(config.naps2Path, ["--driver", "twain", "--listdevices"], (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr });
    }
    const devices = stdout.split("\n").filter(line => line.trim() !== "");
    res.json({ scanners: devices });
  });
};
// =====================
// Helper: Scan one side
// =====================
const scanSide = (scanner, outputPath, format, jpegQuality) => {
  return new Promise((resolve, reject) => {
    const args = [
      "--driver", "twain",
      "--device", scanner,
      "--output", outputPath,
      "--force"
    ];

    if (format === "jpg" && jpegQuality) {
      args.push("--jpegquality", jpegQuality.toString());
    }

    execFile(config.naps2Path, args, (error, stdout, stderr) => {
      if (error) return reject(stderr);
      resolve(outputPath);
    });
  });
};
// =====================
// Trigger scan
// =====================
export const scanDocument = async (req, res) => {
  const { deviceName, fileName, format, jpegQuality, twoSided } = req.body;
  const scanner = deviceName || config.defaultScanner;

  if (!scanner) {
    return res.status(400).json({ error: "No scanner specified" });
  }

  // Decide extension (default from config if missing)
  const extension = format ? format.toLowerCase() : config.defaultFormat;
  const safeFileName = fileName || `scan-${Date.now()}.${extension}`;
  const outputPath = path.join(config.outputDir, safeFileName);

  // Ensure output dir exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // ========== Two-Sided Scan ==========
  if (twoSided) {
    try {
      const timestamp = Date.now();
      const frontPath = path.join(outputDir, `front-${timestamp}.${extension}`);
      const backPath = path.join(outputDir, `back-${timestamp}.${extension}`);
      const finalPdf = path.join(outputDir, `scan-${timestamp}-merged.pdf`);

      // 1. Scan front + back
      await scanSide(scanner, frontPath, extension, jpegQuality);
      await scanSide(scanner, backPath, extension, jpegQuality);

      //  At this point, watcher will process front & back separately
      // → noise removal, compression, and produce encrypted PDFs.
      // We only need to MERGE those encrypted PDFs.

      const encryptedFrontPdf = frontPath.replace(`.${extension}`, "-processed.pdf");
      const encryptedBackPdf = backPath.replace(`.${extension}`, "-processed.pdf");

      // Ensure both exist (wait until watcher processes them)
      const waitForFile = (f) =>
        new Promise((resolve, reject) => {
          const check = setInterval(() => {
            if (fs.existsSync(f)) {
              clearInterval(check);
              resolve(true);
            }
          }, 500);
          setTimeout(() => reject(new Error(`Timeout waiting for ${f}`)), 15000);
        });

      await waitForFile(encryptedFrontPdf);
      await waitForFile(encryptedBackPdf);

      // 2. Merge into one encrypted PDF
      const mergedPdf = await PDFDocument.create();

      for (const pdfPath of [encryptedFrontPdf, encryptedBackPdf]) {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const copied = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copied.forEach((p) => mergedPdf.addPage(p));
      }

      const mergedBytes = await mergedPdf.save({
        useObjectStreams: false,
        password: "secret123",
      });
      fs.writeFileSync(finalPdf, mergedBytes);

      return res.json({
        message: "Two-sided scan completed → merged encrypted PDF created",
        mergedFile: finalPdf,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.toString() });
    }
  }

  // ========== Single-Side Scan ==========
  const args = [
    "--driver", "twain",
    "--device", scanner,
    "--output", outputPath,
    "--force"
  ];

  if (extension === "jpg" && jpegQuality) {
    args.push("--jpegquality", jpegQuality.toString());
  }

  console.log("Running NAPS2:", config.naps2Path, args);

  execFile(config.naps2Path, args, (error, stdout, stderr) => {
    if (error) {
      console.error("Scan error:", stderr);
      return res.status(500).json({ error: stderr });
    }
    res.json({ message: "Scan completed", file: outputPath });
  });
};


// ===========================================================================================================
// Bulk Scan (ADF – multi-page feed)
// This part is completley for giving command to the scanner machine to scan and place the file in the local ok 
// ============================================================================================================


//THIS IS THE UNIQUE FILE GENRATION ======================================
function getUniqueFileName(baseDir, originalName) {
  const ext = path.extname(originalName);         // .pdf
  const name = path.basename(originalName, ext);  // ProjectDocsBatch

  let finalName = originalName;
  let counter = 1;

  while (fs.existsSync(path.join(baseDir, finalName))) {
    finalName = `${name}${counter}${ext}`;
    counter++;
  }

  return finalName;
}

export const bulkScan = async (req, res) => {
  try {
    const { deviceName, fileName, format } = req.body;



    console.log(req.body, "requesttsss")
    const scanner = deviceName || config.defaultScanner;
    const extension = format ? format.toLowerCase() : config.defaultFormat;

    if (!scanner) {
      return res.status(400).json({ error: "No scanner specified" });
    }

    // Create timestamped file name
    // const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    // const safeFileName = fileName || `ScannedBatch_${timestamp}.${extension}`;
    // const outputPath = path.join(config.outputDir, safeFileName);



    // STEP 1: get filename without timestamp
    let incomingName = fileName || `ScannedBatch.${extension}`;
    // STEP 2: generate unique filename (docs, docs1, docs2…)
    const safeFileName = getUniqueFileName(config.outputDir, incomingName);

    // STEP 3: final output path
    const outputPath = path.join(config.outputDir, safeFileName);

    // Make sure output folder exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Command arguments for ADF (Automatic Document Feeder)
    const args = [
      "--driver", "twain",
      "--device", scanner,
      "--source", "feeder",         // it tells scanner to use ADF
      "--output", outputPath,
      "--force",
    ];

    console.log("Running NAPS2 bulk scan:", config.naps2Path, args.join(" "));

    execFile(config.naps2Path, args, async (error, stdout, stderr) => {
      if (error) {
        console.error("Bulk scan error:", stderr, error);
        return res.status(500).json({ error: stderr });
      }

      // Optional wait to ensure file is completely written
      const waitForScanFiles = (prefix) =>
        new Promise((resolve, reject) => {
          let attempts = 0;
          const interval = setInterval(() => {
            const files = fs.readdirSync(config.outputDir);
            const matched = files.filter(f => f.startsWith(prefix));

            if (matched.length > 0) {
              clearInterval(interval);
              resolve(matched);
            }

            attempts++;
            if (attempts >= config.fileStabilityCheck.attempts) {
              clearInterval(interval);
              reject(new Error("Timeout waiting for scan files"));
            }
          }, config.fileStabilityCheck.pollMs);
        });


      const baseName = path.basename(safeFileName, path.extname(safeFileName));
      const scannedFiles = await waitForScanFiles(baseName);
      console.log("Scanned files:", scannedFiles);


      console.log("Bulk scan complete:", outputPath);
      return res.json({
        message: "Bulk scan completed successfully",
        file: outputPath,
      });
    });
  } catch (err) {
    console.error("Bulk scan exception:", err);
    res.status(500).json({ error: err.message });
  }
};


// const scanSide = (scanner, outputPath, extension, jpegQuality) => {
//   return new Promise((resolve, reject) => {
//     const args = [
//       "--driver", "twain",
//       "--device", scanner,
//       "--output", outputPath,
//       "--force"
//     ];

//     if (extension === "jpg" && jpegQuality) {
//       args.push("--jpegquality", jpegQuality.toString());
//     }

//     console.log("Scanning side:", args.join(" "));
//     execFile(config.naps2Path, args, (error, stdout, stderr) => {
//       if (error) return reject(stderr);
//       resolve(stdout);
//     });
//   });
// };

// // ========== Main Function ==========
// export const scanDocument = async (req, res) => {
//   const { deviceName, fileName, format, jpegQuality, twoSided, feeder } = req.body;
//   const scanner = deviceName || config.defaultScanner;

//   if (!scanner) {
//     return res.status(400).json({ error: "No scanner specified" });
//   }

//   const extension = format ? format.toLowerCase() : config.defaultFormat;
//   const safeFileName = fileName || `scan-${Date.now()}.${extension}`;
//   const outputPath = path.join(config.outputDir, safeFileName);

//   // Ensure output directory exists
//   const outputDir = path.dirname(outputPath);
//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir, { recursive: true });
//   }

//   // ========== Automatic Feeder Scan ==========
//   if (feeder) {
//     try {
//       const feederOutput = path.join(outputDir, `BatchScan-${Date.now()}.pdf`);
//       const feederArgs = [
//         "--driver", "twain",
//         "--device", scanner,
//         "--source", "feeder",         // ✅ use automatic feeder
//         "--output", feederOutput,
//         "--format", "pdf",
//         "--force"
//       ];

//       console.log("Running Feeder Scan:", config.naps2Path, feederArgs);
//       execFile(config.naps2Path, feederArgs, (error, stdout, stderr) => {
//         if (error) {
//           console.error("Feeder scan error:", stderr);
//           return res.status(500).json({ error: stderr });
//         }

//         console.log("Feeder Scan Complete:", feederOutput);
//         return res.json({
//           message: "Automatic feeder scan completed",
//           file: feederOutput
//         });
//       });
//     } catch (err) {
//       console.error("Feeder scan failed:", err);
//       return res.status(500).json({ error: err.toString() });
//     }
//     return;
//   }

//   // ========== Two-Sided Scan ==========
//   if (twoSided) {
//     try {
//       const timestamp = Date.now();
//       const frontPath = path.join(outputDir, `front-${timestamp}.${extension}`);
//       const backPath = path.join(outputDir, `back-${timestamp}.${extension}`);
//       const finalPdf = path.join(outputDir, `scan-${timestamp}-merged.pdf`);

//       await scanSide(scanner, frontPath, extension, jpegQuality);
//       await scanSide(scanner, backPath, extension, jpegQuality);

//       const mergedPdf = await PDFDocument.create();
//       for (const pdfPath of [frontPath, backPath]) {
//         const pdfBytes = fs.readFileSync(pdfPath);
//         const pdfDoc = await PDFDocument.load(pdfBytes);
//         const copied = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
//         copied.forEach(p => mergedPdf.addPage(p));
//       }

//       const mergedBytes = await mergedPdf.save();
//       fs.writeFileSync(finalPdf, mergedBytes);

//       return res.json({
//         message: "Two-sided scan completed",
//         mergedFile: finalPdf,
//       });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: err.toString() });
//     }
//   }

//   // ========== Single-Side Scan ==========
//   const args = [
//     "--driver", "twain",
//     "--device", scanner,
//     "--output", outputPath,
//     "--force"
//   ];

//   if (extension === "jpg" && jpegQuality) {
//     args.push("--jpegquality", jpegQuality.toString());
//   }

//   console.log("Running Single Scan:", config.naps2Path, args);
//   execFile(config.naps2Path, args, (error, stdout, stderr) => {
//     if (error) {
//       console.error("Scan error:", stderr);
//       return res.status(500).json({ error: stderr });
//     }
//     res.json({ message: "Scan completed", file: outputPath });
//   });
// };