// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const CLOUD_UPLOAD_PATH = "E:/Dms/CLOUDUPLOADFOLDER";

// // ================== MULTER STORAGE CONFIG ==================
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     try {
//       const Account_Id = req.body?.Account_Id;

//       if (!Account_Id) {
//         return cb(new Error(" Account_Id is required in form-data before file upload."));
//       }

//       const uploadPath = path.join(CLOUD_UPLOAD_PATH, Account_Id.toString());
//       fs.mkdirSync(uploadPath, { recursive: true });
//       cb(null, uploadPath);
//     } catch (err) {
//       cb(err);
//     }
//   },

//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     const docName = req.body.DocumentName || path.basename(file.originalname, ext);
//     const fileName = `${docName}_${Date.now()}${ext}`;
//     cb(null, fileName);
//   },
// });

// // ================== FILE VALIDATION MIDDLEWARE ==================
// export const validateUploadFields = (req, res, next) => {
//   const { Account_Id, div_code, sd_code, so_code } = req.body || {};

//   if (!Account_Id || !div_code || !sd_code || !so_code) {
//     // Delete uploaded file if it exists
//     if (req.file && req.file.path && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//       console.log(" ========Deleted invalid uploaded file:", req.file.path);
//     }

//     return res.status(400).json({
//       error: "Account_Id, div_code, sd_code, and so_code are required before file upload.",
//     });
//   }

//   next();
// };

// // ================== EXPORT MULTER ==================
// export const upload = multer({
//   storage,
//   // limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
// });

// export { CLOUD_UPLOAD_PATH };




// ======================= multerConfig.js =======================
import multer from "multer";
import path from "path";
import fs from "fs";

export const CLOUD_UPLOAD_PATH = "E:/Dms/CLOUDUPLOADFOLDER";

// ================== MULTER STORAGE CONFIG ==================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const Account_Id = req.body?.Account_Id;

      if (!Account_Id) {
        return cb(new Error("Account_Id is required in form-data before file upload."));
      }

      const uploadPath = path.join(CLOUD_UPLOAD_PATH, Account_Id.toString());
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const docName = req.body.DocumentName || path.basename(file.originalname, ext);
    const fileName = `${docName}_${Date.now()}${ext}`;
    cb(null, fileName);
  },
});

// ================== VALIDATION MIDDLEWARE ==================
export const validateUploadFields = (req, res, next) => {
  const { Account_Id, div_code, sd_code, so_code } = req.body || {};

  if (!Account_Id || !div_code || !sd_code || !so_code) {
    //  CHANGED: delete all uploaded files if multiple uploaded
    if (req.files && req.files.length > 0) {
      req.files.forEach((f) => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
      console.log(" ======== Deleted invalid uploaded multiple files =======");
    }

    return res.status(400).json({
      error: "Account_Id, div_code, sd_code, and so_code are required before file upload.",
    });
  }

  next();
};

// ================== EXPORT MULTER ==================
//  CHANGED FROM single TO array FOR MULTIPLE FILE SUPPORT
export const upload = multer({
  storage,
});
