// const path = require("path");

// module.exports = {
//   naps2Path: "C:\\Program Files\\NAPS2\\NAPS2.Console.exe",
//   defaultScanner: "Canon MF460 ser_6CF2D8AE9F40",
//   defaultResolution: 300,
//   defaultFormat: "pdf",

//   // Shared folder (this must exist and be accessible by your service)
//   outputDir: "Z:\\192.168.23.15File_Uplode\\scanningDocs"
// };


// import path from "path";

// const config = {
//   naps2Path: "C:\\Program Files\\NAPS2\\NAPS2.Console.exe",
//   defaultScanner: "Canon MF460 ser_6CF2D8AE9F40",
//   defaultResolution: 300,
//   defaultFormat: "pdf",

//   // Folder where NAPS2 writes scans (watch this)
//   outputDir: "E:\\Dms\\scanDocument",

  

//   // Frontend origin for Socket.IO CORS
//   socketCorsOrigin: "*",

//   // Ensure file fully written before processing
//   fileStabilityCheck: {
//     pollMs: 300,
//     attempts: 10
//   }
// };

// const config = {
//   naps2Path: "C:\\Program Files\\NAPS2\\NAPS2.Console.exe",
//   defaultScanner: "Canon MF460 ser_6CF2D8AE9F40",
//   defaultResolution: 300,
//   defaultFormat: "pdf",
//   outputDir: "E:\\Dms\\scanDocument",
//   socketCorsOrigin: "*",
//   fileStabilityCheck: {
//     pollMs: 300,
//     attempts: 10
//   }
// };

// export default config;


// C:\Users\Praveen>"C:\Program Files\NAPS2\NAPS2.Console.exe" --driver twain --device "Canon MF460 ser_6CF2D8AE9F40" --source feeder --output "E:\Dms\scanDocument\ScannedBatch_2025-10-29T11-45-00.pdf" --force

// C:\Users\Praveen>"C:\Program Files\NAPS2\NAPS2.Console.exe" --driver twain --device "Canon MF460 ser_6CF2D8AE9F40" --output "E:\DmsscanDocument\ScannedFile_2025-10-29T11-10-00.jpg" --force



const config = {
  // Path to NAPS2 executable
  naps2Path: "C:\\Program Files\\NAPS2\\NAPS2.Console.exe",

  // Default scanner name
  defaultScanner: "Canon MF460 ser_6CF2D8AE9F40",

  // Scan settings
  defaultResolution: 300,
  defaultFormat: "pdf",

  // Folder where scanned files will be saved
  outputDir: "E:\\Dms\\SCANDOCS",

  // CORS allowed origin
  socketCorsOrigin: "*",

  // File write stability check settings
  fileStabilityCheck: {
    pollMs: 300,
    attempts: 10,
  },
};

export default config;
