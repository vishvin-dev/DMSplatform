import fs from "fs";
import multer from "multer";
import * as backendHelpers from "../helpers/backend_helpers.js";
import userRoute from "../Routes/userRoute/user.js";
import userCreation from "../Routes/userCreation/userCreation.js";
import RolesCreation from "../Routes/RolesCreation/RolesCreation.js";
import ResetPassword from "../Routes/ResetPassword/ResetPassword.js";
import ManageUser from "../Routes/ManageUser/manageUser.js";
import ZoneUpload from "../Routes/ZoneUpload/ZoneUpload.js";
import ConsumerUpload from "../Routes/ConsumerUpload/ConsumerUpload.js";
import LoginAudit from "../Routes/LoginAudit/LoginAudit.js"
import DocumentUpload from "../Routes/DocumentUpload/DocumentUpload.js"
import DocumentCategory from "../Routes/DocumentCategory/DocumentCategory.js"
import Qcupload from "../Routes/Qcupload/Qcupload.js"
import DocumentsAuditLogs from "../Routes/DocumentsAuditLogs/DocumentsAuditLogs.js"

 
// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

const applyRoutes = (app) => {
  app.use(backendHelpers.LOGIN_API, userRoute);   //here that i removed the div subdiv and the section things ok 
  app.use(backendHelpers.USER_CREATION, upload.single("photo"), userCreation);   //here that i removed the div subdiv and the section things ok 
  app.use(backendHelpers.ROLES_CREATION, RolesCreation);
  app.use(backendHelpers.RESET_PASSWORD, ResetPassword);
  app.use(backendHelpers.EDIT_USER, ManageUser);
  app.use(backendHelpers.ZONE_UPLOAD, ZoneUpload);
  app.use(backendHelpers.CONSUMER_UPLOAD, ConsumerUpload);
  app.use(backendHelpers.LOGIN_AUDIT, LoginAudit);
  app.use(backendHelpers.DOCUMENT_CATEGORY, DocumentCategory);

  app.use(backendHelpers.DOCUMENT_UPLOAD, DocumentUpload);

  app.use(backendHelpers.QC_UPLOAD, Qcupload);
  
  //audit logs of the documents
  app.use(backendHelpers.DOCUMENT_AUDIT_LOGS, DocumentsAuditLogs);
  
};

export default applyRoutes;

