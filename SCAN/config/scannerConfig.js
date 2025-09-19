// const path = require("path");

// module.exports = {
//   naps2Path: "C:\\Program Files\\NAPS2\\NAPS2.Console.exe",
//   defaultScanner: "Canon MF460 ser_6CF2D8AE9F40",
//   defaultResolution: 300,
//   defaultFormat: "pdf",

//   // Shared folder (this must exist and be accessible by your service)
//   outputDir: "Z:\\192.168.23.15File_Uplode\\scanningDocs"
// };


import path from "path";

const config = {
  naps2Path: "C:\\Program Files\\NAPS2\\NAPS2.Console.exe",
  defaultScanner: "Canon MF460 ser_6CF2D8AE9F40",
  defaultResolution: 300,
  defaultFormat: "pdf",

  // Folder where NAPS2 writes scans (watch this)
  outputDir: "Z:\\192.168.23.15File_Uplode\\scanningDocs",

  // Frontend origin for Socket.IO CORS
  socketCorsOrigin: "*",

  // Ensure file fully written before processing
  fileStabilityCheck: {
    pollMs: 300,
    attempts: 10
  }
};

export default config;


