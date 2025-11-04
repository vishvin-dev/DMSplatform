import multer from "multer";
import path from "path";
import fs from "fs";

const CLOUD_UPLOAD_PATH = "E:/Dms/CLOUDUPLOADFOLDER";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { Account_Id } = req.body;
    if (!Account_Id) return cb(new Error("Account_Id is required"));

    const uploadPath = path.join(CLOUD_UPLOAD_PATH, Account_Id);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const docName = req.body.DocumentName || path.basename(file.originalname, ext);
    const fileName = `${docName}_${Date.now()}${ext}`;
    cb(null, fileName);
  },
});

export const upload = multer({ storage });
export { CLOUD_UPLOAD_PATH };
