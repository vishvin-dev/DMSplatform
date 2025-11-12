import path from "path";
import fs from "fs";
import mime from "mime-types"
import { pool } from "../../Config/db.js";
import { getZone, getDivisions, getSubDivisions, getSections, getRoles, getDocumentLists, getCircle } from "../../models/userModel.js"
import {
    getAccountId, getConsumerDetails, postFileUpload, getDocumentCategory, getDocumentsView, getSingleDocumentById, getSingleDocumentByIdByDraft, postFileMetaOnly,
    markOldVersionNotLatest, updateDocumentStatus, resolveRejection, saveDraft, fetchDraftDocumentByAccountId, finalizeDrafts
} from "../../models/DocumentUpload.js"

import { insertDocumentUpload, getLatestVersion, insertDocumentVersion, getNextVersionLabel, getDocsMetaInfo, getDocsVieww } from "../../models/MannualUpload.js"
import { count } from "console";

//this is the doucment uploading things
export const DocumentUpload = async (req, res) => {
    const {
        flagId,
        zone_code,
        circle_code,
        div_code,
        sd_code,
        section,
        account_id,
    }
        = req.body;
    try {
        let results;

        if (flagId === 1) {
            results = await getDivisions(circle_code);
        }
        else if (flagId === 14) {
            results = await getZone();
        }
        else if (flagId === 11) {
            results = await getCircle(zone_code);
        } else if (flagId === 2) {
            if (!div_code) return res.status(400).json({ error: "div_code is required" });
            results = await getSubDivisions(div_code);
        } else if (flagId === 3) {
            if (!sd_code) return res.status(400).json({ error: "sd_code is required" });
            results = await getSections(sd_code);
        } else if (flagId === 4) {
            results = await getAccountId(section, account_id);
            return res.json({
                status: "success",
                message: "DropDown Data is fetched successfully",
                length: results.length,
                data: results,
            });
        }
        else if (flagId === 5) {
            if (!account_id) return res.status(400).json({ error: "account_id is required" });
            results = await getConsumerDetails(account_id);
            return res.status(201).json({ status: "success", message: "Account Details Fetched successfully.", data: results })
        }
        else if (flagId === 6) {
            results = await getRoles();
        }
        else if (flagId === 7) {
            results = await getDocumentCategory();
        }
        // else if (parseInt(flagId) === 8) {
        //     const {
        //         DocumentName,
        //         DocumentDescription,
        //         MetaTags,
        //         CreatedByUser_Id,
        //         account_id,
        //         CreatedByUserName,
        //         Category_Id,
        //         Status_Id,
        //         Role_Id,
        //         ReUploadDocumentId, // <-- new field for re-upload
        //         ChangeReason // optional
        //     } = req.body;

        //     const uploadResults = [];
        //     const mandatoryFields = ["IDproof", "OwnerShipproof", "KhataCertificate", "PowerAgreement", "SiteSketch"];

        //     for (let field of mandatoryFields) {
        //         if (req.files[field] && req.files[field].length > 0) {
        //             const file = req.files[field][0];
        //             const FilePath = file.path;

        //             let docId = ReUploadDocumentId;
        //             let versionLabel = "v1";

        //             if (docId) {
        //                 // re-upload → new version
        //                 const latest = await getLatestVersion(docId);
        //                 versionLabel = getNextVersionLabel(latest.VersionLabel);
        //                 await markOldVersionNotLatest(docId);
        //                 await insertDocumentVersion(docId, versionLabel, FilePath, CreatedByUser_Id, ChangeReason);
        //                 await updateDocumentStatus(docId, Status_Id); // directly update status by ID
        //                 await resolveRejection(docId);
        //             } else {
        //                 // first upload
        //                 docId = await postFileMetaOnly(
        //                     `${DocumentName} - ${field}`,
        //                     DocumentDescription,
        //                     MetaTags,
        //                     CreatedByUser_Id,
        //                     account_id,
        //                     CreatedByUserName,
        //                     Category_Id,
        //                     Status_Id,
        //                     Role_Id
        //                 );
        //                 await insertDocumentVersion(docId, versionLabel, FilePath, CreatedByUser_Id);
        //             }

        //             uploadResults.push({ field, DocumentId: docId, versionLabel });
        //         }
        //     }

        //     // Optional files
        //     if (req.files.otherDocuments && req.files.otherDocuments.length > 0) {
        //         for (let file of req.files.otherDocuments) {
        //             const FilePath = file.path;

        //             let docId = ReUploadDocumentId;
        //             let versionLabel = "v1";

        //             if (docId) {
        //                 const latest = await getLatestVersion(docId);
        //                 versionLabel = getNextVersionLabel(latest.VersionLabel);
        //                 await markOldVersionNotLatest(docId);
        //                 await insertDocumentVersion(docId, versionLabel, FilePath, CreatedByUser_Id, ChangeReason);
        //                 await updateDocumentStatus(docId, Status_Id); // directly update status by ID
        //                 await resolveRejection(docId);
        //             } else {
        //                 docId = await postFileMetaOnly(
        //                     `${DocumentName} - Additional`,
        //                     DocumentDescription,
        //                     MetaTags,
        //                     CreatedByUser_Id,
        //                     account_id,
        //                     CreatedByUserName,
        //                     Category_Id,
        //                     Status_Id,
        //                     Role_Id
        //                 );
        //                 await insertDocumentVersion(docId, versionLabel, FilePath, CreatedByUser_Id);
        //             }

        //             uploadResults.push({ field: "otherDocuments", DocumentId: docId, versionLabel });
        //         }
        //     }

        //     if (uploadResults.length === 0) {
        //         return res.status(400).json({ error: "No files uploaded." });
        //     }

        //     return res.json({
        //         status: "success",
        //         message: "Files uploaded successfully",
        //         uploadedFiles: uploadResults.length,
        //         data: uploadResults
        //     });
        // }

        else if (flagId === 9) {
            results = await getDocumentLists();
        }
        // else if (parseInt(flagId) === 10) {
        //     const {
        //         DocumentName,
        //         DocumentDescription,
        //         MetaTags,
        //         CreatedByUser_Id,
        //         account_id,
        //         CreatedByUserName,
        //         Category_Id,
        //         Status_Id,
        //         Role_Id,
        //         ReUploadDocumentId, // <-- new field for re-upload
        //         ChangeReason // optional
        //     } = req.body;

        //     const uploadResults = [];
        //     // Mandatory list for flagId=10
        //     const mandatoryDocs = [
        //         "AadharCard",
        //         "EPICVoterIDCard",
        //         "DrivingLicense",
        //         "Passport",
        //         "PANCard",
        //         "TANCard",
        //         "OwnerShipProof",
        //         "KhataCertificate",
        //         "PowerAgreement",
        //         "SiteSketch"
        //     ];

        //     // Handle mandatory uploads
        //     for (let field of mandatoryDocs) {
        //         if (req.files[field] && req.files[field].length > 0) {
        //             const file = req.files[field][0];
        //             const FilePath = file.path;

        //             let docId = ReUploadDocumentId;
        //             let versionLabel = "v1";

        //             if (docId) {
        //                 // re-upload → new version
        //                 const latest = await getLatestVersion(docId);
        //                 versionLabel = getNextVersionLabel(latest.VersionLabel);
        //                 await markOldVersionNotLatest(docId);
        //                 await insertDocumentVersion(docId, versionLabel, FilePath, CreatedByUser_Id, ChangeReason);
        //                 await updateDocumentStatus(docId, Status_Id);
        //                 await resolveRejection(docId);
        //             } else {
        //                 // first upload
        //                 docId = await postFileMetaOnly(
        //                     `${DocumentName} - ${field}`,
        //                     DocumentDescription,
        //                     MetaTags,
        //                     CreatedByUser_Id,
        //                     account_id,
        //                     CreatedByUserName,
        //                     Category_Id,
        //                     Status_Id,
        //                     Role_Id
        //                 );
        //                 await insertDocumentVersion(docId, versionLabel, FilePath, CreatedByUser_Id);
        //             }

        //             uploadResults.push({ field, DocumentId: docId, versionLabel });
        //         }
        //     }

        //     // Optional "Other Documents"
        //     if (req.files.OtherDocuments && req.files.OtherDocuments.length > 0) {
        //         for (let file of req.files.OtherDocuments) {
        //             const FilePath = file.path;

        //             let docId = ReUploadDocumentId;
        //             let versionLabel = "v1";

        //             if (docId) {
        //                 const latest = await getLatestVersion(docId);
        //                 versionLabel = getNextVersionLabel(latest.VersionLabel);
        //                 await markOldVersionNotLatest(docId);
        //                 await insertDocumentVersion(docId, versionLabel, FilePath, CreatedByUser_Id, ChangeReason);
        //                 await updateDocumentStatus(docId, Status_Id);
        //                 await resolveRejection(docId);
        //             } else {
        //                 docId = await postFileMetaOnly(
        //                     `${DocumentName} - Additional`,
        //                     DocumentDescription,
        //                     MetaTags,
        //                     CreatedByUser_Id,
        //                     account_id,
        //                     CreatedByUserName,
        //                     Category_Id,
        //                     Status_Id,
        //                     Role_Id
        //                 );
        //                 await insertDocumentVersion(docId, versionLabel, FilePath, CreatedByUser_Id);
        //             }

        //             uploadResults.push({ field: "OtherDocuments", DocumentId: docId, versionLabel });
        //         }
        //     }

        //     if (uploadResults.length === 0) {
        //         return res.status(400).json({ error: "No files uploaded." });
        //     }

        //     return res.json({
        //         status: "success",
        //         message: "Files uploaded successfully (flagId 10)",
        //         uploadedFiles: uploadResults.length,
        //         data: uploadResults
        //     });
        // }

        //This is The final uploading the documents ok 
        //     else if (parseInt(flagId) === 10) {
        //         console.log(req.body)
        //         const {
        //             DocumentName,
        //             DocumentDescription,
        //             MetaTags,
        //             CreatedByUser_Id,
        //             account_id,
        //             CreatedByUserName,
        //             Category_Id,
        //             Status_Id,
        //             Role_Id,
        //             ReUploadDocumentId, // optional re-upload
        //             ChangeReason, // optional
        //             div_code,   
        //             sd_code,
        //             so_code
        //         } = req.body;

        // const uploadResults = [];

        // // 1. Check for drafts for this account
        // const drafts = await fetchDraftDocumentByAccountId(account_id);

        // if (drafts.length > 0) {
        //     for (const draft of drafts) {
        //         let docId = await postFileMetaOnly(
        //             draft.DraftName,
        //             draft.DraftDescription,
        //             draft.MetaTags || MetaTags,
        //             CreatedByUser_Id,
        //             account_id,
        //             draft.CreatedByUserName || CreatedByUserName,
        //             Category_Id,
        //             Status_Id,
        //             Role_Id,
        //             div_code,   
        //             sd_code,
        //             so_code
        //         );

        //         // Insert into documentversion
        //         await insertDocumentVersion(docId, 'v1', draft.FilePath, CreatedByUser_Id);

        //         uploadResults.push({ field: 'DraftFile', DocumentId: docId, versionLabel: 'v1' });
        //     }

        //     // Mark drafts as finalized
        //         const draftIds = drafts.map(d => d.Draft_Id);
        //         await finalizeDrafts(draftIds);
        // }

        // // 2. Handle new uploads (mandatory + other documents)
        // // const mandatoryDocs = [
        // //     "AadharCard",
        // //     "EPICVoterIDCard",
        // //     "DrivingLicense",
        // //     "Passport",
        // //     "PANCard",
        // //     "TANCard",
        // //     "OwnerShipProof",
        // //     "KhataCertificate",
        // //     "PowerAgreement",
        // //     "SiteSketch"
        // // ];

        // // // Mandatory files
        // // for (let field of mandatoryDocs) {
        // //     if (req.files[field] && req.files[field].length > 0) {
        // //         const file = req.files[field][0];
        // //         const FilePath = file.path;

        // //         let docId = ReUploadDocumentId;
        // //         let versionLabel = "v1";

        // //         if (docId) {
        // //             const latest = await getLatestVersion(docId);
        // //             versionLabel = getNextVersionLabel(latest.VersionLabel);
        // //             await markOldVersionNotLatest(docId);
        // //             await insertDocumentVersion(docId, versionLabel, FilePath, CreatedByUser_Id, ChangeReason);
        // //             await updateDocumentStatus(docId, Status_Id);
        // //             await resolveRejection(docId);
        // //         } else {
        // //             docId = await postFileMetaOnly(
        // //                 `${DocumentName} - ${field}`,
        // //                 DocumentDescription,
        // //                 MetaTags,
        // //                 CreatedByUser_Id,
        // //                 account_id,
        // //                 CreatedByUserName,
        // //                 Category_Id,
        // //                 Status_Id,
        // //                 Role_Id,
        // //                 div_code,   
        // //                 sd_code,
        // //                 so_code
        // //             );
        // //             await insertDocumentVersion(docId, versionLabel, FilePath, CreatedByUser_Id);
        // //         }

        // //         uploadResults.push({ field, DocumentId: docId, versionLabel });
        // //     }
        // // }

        // // // Optional files
        // // if (req.files.OtherDocuments && req.files.OtherDocuments.length > 0) {
        // //     for (let file of req.files.OtherDocuments) {
        // //         const FilePath = file.path;

        // //         let docId = ReUploadDocumentId;
        // //         let versionLabel = "v1";

        // //         if (docId) {
        // //             const latest = await getLatestVersion(docId);
        // //             versionLabel = getNextVersionLabel(latest.VersionLabel);
        // //             await markOldVersionNotLatest(docId);
        // //             await insertDocumentVersion(docId, versionLabel, FilePath, CreatedByUser_Id, ChangeReason);
        // //             await updateDocumentStatus(docId, Status_Id);
        // //             await resolveRejection(docId);
        // //         } else {
        // //             docId = await postFileMetaOnly(
        // //                 `${DocumentName} - Additional`,
        // //                 DocumentDescription,
        // //                 MetaTags,
        // //                 CreatedByUser_Id,
        // //                 account_id,
        // //                 CreatedByUserName,
        // //                 Category_Id,
        // //                 Status_Id,
        // //                 Role_Id,
        // //                 div_code,   
        // //                 sd_code,
        // //                 so_code
        // //             );
        // //             await insertDocumentVersion(docId, versionLabel, FilePath, CreatedByUser_Id);
        // //         }

        // //         uploadResults.push({ field: "OtherDocuments", DocumentId: docId, versionLabel });
        // //     }
        // // }

        // // if (uploadResults.length === 0) {
        // //     return res.status(400).json({ error: "No files uploaded." });
        // // }

        // //         let message = "";

        // //         if (drafts.length > 0 && uploadResults.some(u => u.field === "DraftFile")) {
        // //             message = "Draft files finalized and uploaded successfully along with new files.";
        // //         } else if (uploadResults.length > 0) {
        // //             message = "Files uploaded successfully (no drafts to finalize).";
        // //         } else {
        // //             return res.status(400).json({ error: "No files uploaded." });
        // //         }

        //         // return res.json({
        //         //     status: "success",
        //         //     message,
        //         //     uploadedFiles: uploadResults.length,
        //         //     data: uploadResults
        //         // })
        //     }

        else if (parseInt(flagId) === 10) {
            const {
                account_id,
                CreatedByUser_Id,
                Status_Id
            } = req.body;

            const uploadResults = [];

            // 1. Fetch all drafts for this account
            const drafts = await fetchDraftDocumentByAccountId(account_id);

            if (drafts.length === 0) {
                return res.status(400).json({ error: "No drafts found to finalize." });
            }

            // 2. Process drafts → move each to DocumentUpload + DocumentVersion
            for (const draft of drafts) {
                // Insert into DocumentUpload using draft metadata
                const docId = await postFileMetaOnly(
                    draft.DraftName,
                    draft.DraftDescription,
                    draft.MetaTags,
                    draft.CreatedByUser_Id,
                    draft.Account_Id,
                    draft.CreatedByUserName,
                    draft.Category_Id,
                    Status_Id || 1, // use provided or default to 1
                    draft.Role_Id,
                    draft.div_code,
                    draft.sd_code,
                    draft.so_code
                );

                // Insert first version
                await insertDocumentVersion(docId, 'v1', draft.FilePath, CreatedByUser_Id);

                uploadResults.push({
                    field: 'DraftFile',
                    DocumentId: docId,
                    versionLabel: 'v1'
                });
            }

            // 3. Mark drafts as finalized
            const draftIds = drafts.map(d => d.Draft_Id);
            await finalizeDrafts(draftIds);

            // 4. Response
            return res.json({
                status: "success",
                message: "Draft files finalized and uploaded successfully.",
                uploadedFiles: uploadResults.length,
                data: uploadResults
            });
        }
        // This is the draft docunments upload ok 
        else if (parseInt(flagId) === 12) {
            const {
                DraftName,
                DraftDescription,
                MetaTags,
                CreatedByUser_Id,
                Account_Id,
                CreatedByUserName,
                Category_Id,
                Role_Id,
                div_code,
                sd_code,
                so_code
            } = req.body;

            // check file
            if (!req.files || !req.files.DraftFile) {
                return res.status(400).json({ error: "No draft file uploaded." });
            }

            const file = req.files.DraftFile[0];
            const FilePath = file.path; // multer saves path here

            // insert into DB
            const draftId = await saveDraft(
                DraftName,
                DraftDescription,
                MetaTags,
                Account_Id,
                FilePath,
                CreatedByUser_Id,
                CreatedByUserName,
                Role_Id,
                Category_Id,
                div_code,
                sd_code,
                so_code
            );
            return res.json({
                status: "success",
                message: "Draft saved successfully",
                draftId,
            });
        }
        else if (flagId === 13) {
            const draftDocs = await fetchDraftDocumentByAccountId(account_id);

            if (draftDocs && draftDocs.length > 0) {
                results = draftDocs;
            } else {
                results = "No draft documents found for this account";
            }
        }
        else {
            return res.status(400).json({ error: "Invalid flagId" });
        }
        return res.json({ status: "success", message: "Data fetched successfully", data: results });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }
};

//this is the document View
// export const DocumentView = async (req, res) => {
//     const { flagId, DocumentId, accountId, roleId } = req.body;

//     try {
//         if (parseInt(flagId) === 1) {
//             if (!accountId) {
//                 return res.status(400).json({ status: "error", message: "accountId is required" });
//             }
//             const results = await getDocumentsView(accountId, roleId);
//             return res.status(200).json({
//                 status: "success",
//                 message: "Document Data fetched successfully",
//                 data: results,
//             });
//         }
//         else if (parseInt(flagId) === 2) {
//             if (!DocumentId) {
//                 return res.status(400).json({ status: "error", message: "DocumentId is required" });
//             }
//             const documentData = await getSingleDocumentById(DocumentId);
//             if (!documentData || documentData.length === 0) {
//                 return res.status(404).json({ status: "error", message: "Document not found" });
//             }
//             const rawFilePath = path.resolve(documentData[0].FilePath);
//             const fileName = path.basename(rawFilePath);

//             if (!fs.existsSync(rawFilePath)) {
//                 return res.status(404).json({ status: "error", message: "File not found on server" });
//             }
//             const mimeType = mime.lookup(rawFilePath) || "application/octet-stream";
//             const stream = fs.createReadStream(rawFilePath);

//             res.setHeader("Content-Type", mimeType);
//             res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
//             res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

//             stream.on("error", (err) => {
//                 console.error("Stream Error:", err);
//                 return res.status(500).json({ status: "error", message: "Error streaming file" });
//             });
//             stream.pipe(res);
//         }
//         else if (parseInt(flagId) === 3) {
//             if (!DocumentId) {
//                 return res.status(400).json({ status: "error", message: "DocumentId is required" });
//             }
//             const documentData = await getSingleDocumentByIdByDraft(DocumentId);
//             if (!documentData || documentData.length === 0) {
//                 return res.status(404).json({ status: "error", message: "Document not found" });
//             }
//             const rawFilePath = path.resolve(documentData[0].FilePath);
//             const fileName = path.basename(rawFilePath);

//             if (!fs.existsSync(rawFilePath)) {
//                 return res.status(404).json({ status: "error", message: "File not found on server" });
//             }
//             const mimeType = mime.lookup(rawFilePath) || "application/octet-stream";
//             const stream = fs.createReadStream(rawFilePath);

//             res.setHeader("Content-Type", mimeType);
//             res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
//             res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

//             stream.on("error", (err) => {
//                 console.error("Stream Error:", err);
//                 return res.status(500).json({ status: "error", message: "Error streaming file" });
//             });
//             stream.pipe(res);
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).json({ status: "error", message: "Internal Server Error" });
//     }
// };



//==============================THIS IS THE MANNUAL CONTROLLERS=========================================================
export const MannualUpload = async (req, res) => {
  try {
    const {
      DocumentName,
      DocumentDescription,
      MetaTags,
      CreatedByUser_Id,
      CreatedByUserName,
      Account_Id,
      Role_Id,
      Category_Id,
      Status_Id,
      ChangeReason,
      div_code,
      sd_code,
      so_code,
    } = req.body;

    const changeReasonValue = ChangeReason ?? null;

    // 🔹 Step 1: Validation
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    if (!div_code || !sd_code || !so_code) {
      return res.status(400).json({
        error: "div_code, sd_code, and so_code are required.",
      });
    }

    // 🔹 Step 2: Check if document already exists
    const [existingDocs] = await pool.execute(
      `SELECT DocumentId FROM documentupload WHERE Account_Id = ? LIMIT 1`,
      [Account_Id]
    );

    let documentId;
    if (existingDocs.length > 0) {
      documentId = existingDocs[0].DocumentId;
    } else {
      const newDocId = await insertDocumentUpload(
        DocumentName,
        DocumentDescription,
        MetaTags,
        CreatedByUser_Id,
        CreatedByUserName,
        Account_Id,
        Role_Id,
        Category_Id,
        div_code,
        sd_code,
        so_code
      );
      documentId = newDocId;
    }

    // 🔹 Step 3: Get next version
    const latestVersion = await getLatestVersion(documentId);
    const nextVersion = getNextVersionLabel(latestVersion);

    // 🔹 Step 4: File path
    const filePath = path.join(
      "E:/Dms/CLOUDUPLOADFOLDER",
      Account_Id.toString(),
      req.file.filename
    );

    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 🔹 Step 5: Insert new version record
    const [newVersionId] = await insertDocumentVersion(
      documentId,
      nextVersion,
      filePath,
      1,
      changeReasonValue,
      DocumentName,
      DocumentDescription,
      MetaTags,
      Status_Id ?? 1,
      CreatedByUser_Id
    );

    // 🔹 Step 6: If re-upload, toggle old rejected record based on Version_Id
    if (changeReasonValue) {
      // 1️⃣ Find the previously rejected version (status 3)
      const [rejectedVersion] = await pool.execute(
        `
        SELECT Version_Id 
        FROM documentversion 
        WHERE DocumentId = ? AND Status_Id = 3
        ORDER BY Version_Id DESC LIMIT 1
        `,
        [documentId]
      );

      if (rejectedVersion.length > 0) {
        const oldVersionId = rejectedVersion[0].Version_Id;

        // 2️⃣ Update rejection queue for that specific Version_Id
        await pool.execute(
          `
          UPDATE documentrejectionqueue
          SET Status_Id = 1, IsResolved = 0, RejectedOn = NOW()
          WHERE Version_Id = ? AND Status_Id = 3
          `,
          [oldVersionId]
        );

        // 3️⃣ Optionally, update old version’s status to 1 (Pending again)
        await pool.execute(
          `
          UPDATE documentversion
          SET Status_Id = 1
          WHERE Version_Id = ?
          `,
          [oldVersionId]
        );
      }
    }

    // 🔹 Step 7: Response
    return res.status(200).json({
      status: "success",
      message:
        existingDocs.length > 0
          ? changeReasonValue
            ? `Re-upload successful (Version: ${nextVersion})`
            : `New version uploaded (${nextVersion})`
          : "New document created (v1)",
      DocumentId: documentId,
      VersionId: newVersionId,
      Version: nextVersion,
      FilePath: filePath,
    });
  } catch (error) {
    console.error("❌ Error in Document Upload:", error);
    return res.status(500).json({ error: error.message });
  }
};
//==============================THIS IS THE SCANUPLAOD CONTROLLERS=========================================================
export const ScanUpload = async (req, res) => {
    try {

    } catch (error) {
        console.log("Error In Document Uploading", error)
        return res.status(500).json({ error: error.message })
    }
}

// =========================================================================================================================
export const DocumentView = async (req, res) => {
    const { flagId, Version_Id , accountId } = req.body;
    

    try {
        if (parseInt(flagId) === 1) {
            if (!accountId) {
                return res.status(400).json({ status: "error", message: "accountId is required" });
            }
            const results = await getDocsMetaInfo(accountId);
            return res.status(200).json({
                status: "success",
                message: "Document Data fetched successfully",
                count: results.length,
                data: results,
            });
        }
        else if (parseInt(flagId) === 2) {

            const result = await getDocsVieww(Version_Id);

            if (!result || result.length === 0) {
                return res.status(404).json({ error: "No file found for this Version_Id " });
            }

            const filePath = result[0].FilePath;

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: "File does not exist on server" });
            }

            // --- Security headers ---
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: "File does not exist on server" });
            }

            // --- Set headers before sending the file ---
            res.set({
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${path.basename(filePath)}"`,
                "Cache-Control": "private, no-store, max-age=0",
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
            });

            // Send the file
            res.sendFile(path.resolve(filePath));

        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};















