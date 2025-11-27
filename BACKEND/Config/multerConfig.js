import multer from "multer";
import fs from "fs";

const networkFolder = "E:\\Dms\\Draftcloud";
const indentNetworkFolder = "Z:\\192.168.23.15\\IndentFile";


const getUploadFolder = (req) => {
  if (req.originalUrl.includes("zoneupload")) {
    return "uploads/zoneupload";
  } else if (req.originalUrl.includes("consumerUpload")) {
    return "uploads/consumerdetails";
  } else if (req.originalUrl.includes("documentUpload")) {
    return networkFolder;
  } else if (req.originalUrl.includes("IndentProjectHead")) {
    //  New route for Indent Final Approved Files
    return indentNetworkFolder;
  } else {
    return "uploads/other";
  }
};



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadFolder = getUploadFolder(req);
    fs.mkdirSync(uploadFolder, { recursive: true });
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// For zone and consumer upload (single file)
export const uploadSingle = multer({ storage });

// For document upload with multiple fields
export const uploadMultiple = multer({ storage }).fields([
  // // For flagId === 8 (old set)
  // { name: "IDproof", maxCount: 1 },
  // { name: "OwnerShipproof", maxCount: 1 },
  // { name: "KhataCertificate", maxCount: 1 },
  // { name: "PowerAgreement", maxCount: 1 },
  // { name: "SiteSketch", maxCount: 1 },
  // { name: "otherDocuments", maxCount: 10 },

  // // For flagId === 10 (new set)
  // { name: "AadharCard", maxCount: 10 },
  // { name: "EPICVoterIDCard", maxCount: 10},
  // { name: "DrivingLicense", maxCount: 10 },
  // { name: "Passport", maxCount: 10 },
  // { name: "PANCard", maxCount: 10 },
  // { name: "TANCard", maxCount: 10 },
  // { name: "OwnerShipProof", maxCount: 10 },
  // { name: "KhataCertificate", maxCount: 10},
  // { name: "PowerAgreement", maxCount: 10 },
  // { name: "SiteSketch", maxCount: 10 },
  // { name: "OtherDocuments", maxCount: 10 },

  { name: "DraftFile", maxCount: 100 }
]);

//THIS IS THE INDENT STORING OK 

export const uploadIndentFinal = multer({ storage }).single("ApprovedFilePath");