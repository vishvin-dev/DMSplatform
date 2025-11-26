import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

export const convertImagesToPdf = async (filePaths, outputFolder, prefix = "Final_") => {
  const pdfDoc = await PDFDocument.create();

  for (const imgPath of filePaths) {
    const imgBytes = fs.readFileSync(imgPath);
    const ext = path.extname(imgPath).toLowerCase();

    let image;
    if (ext === ".jpg" || ext === ".jpeg") {
      image = await pdfDoc.embedJpg(imgBytes);
    } else if (ext === ".png") {
      image = await pdfDoc.embedPng(imgBytes);
    } else {
      throw new Error(`Unsupported image type: ${ext}`);
    }

    const dims = image.scale(1);
    const scale = Math.min(A4_WIDTH / dims.width, A4_HEIGHT / dims.height);

    const scaledWidth = dims.width * scale;
    const scaledHeight = dims.height * scale;

    const x = (A4_WIDTH - scaledWidth) / 2;
    const y = (A4_HEIGHT - scaledHeight) / 2;

    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    page.drawImage(image, { x, y, width: scaledWidth, height: scaledHeight });
  }

  const pdfBytes = await pdfDoc.save();
  fs.mkdirSync(outputFolder, { recursive: true });

  const pdfFileName = `${prefix}${Date.now()}.pdf`;
  const pdfFilePath = path.join(outputFolder, pdfFileName);

  fs.writeFileSync(pdfFilePath, pdfBytes);

  return { pdfFilePath, pdfFileName };
};
