import { pool } from "../Config/db.js";

// export const getAllQCDetails = async (roleId) => {
//     const [result] = await pool.execute(
//         `
//         SELECT 
//             du.DocumentId,
//             du.DocumentName,
//             dv.FilePath, -- from DocumentVersion,
//             dv.VersionLabel,
//             du.Account_Id,
//             u.Email AS UploadedBy,
//             du.MetaTags,
//             du.CreatedByUser_Id,
//             du.CreatedAt,
//             du.UpdatedOn,
//             cd.division,
//             cd.sub_division,
//             cd.section,
//             cd.rr_no,
//             cd.consumer_name,
//             cd.consumer_address
//         FROM 
//             DocumentUpload du
//         JOIN DocumentVersion dv ON dv.DocumentId = du.DocumentId AND dv.IsLatest = 1
//         JOIN consumer_details cd 
//             ON du.Account_Id = cd.account_id
//         JOIN zone_codes zc 
//             ON TRIM(cd.division) = TRIM(zc.div_code)
//            AND TRIM(cd.sub_division) = TRIM(zc.sd_code)
//            AND TRIM(cd.section) = TRIM(zc.so_code)
//         JOIN User u 
//             ON du.CreatedByUser_Id = u.User_Id
//         WHERE 
//             du.CreatedByUser_Id NOT IN (
//                 SELECT User_Id FROM User WHERE Role_Id = 2
//             )
//             AND (zc.div_code, zc.sd_code, zc.so_code) IN (
//                 SELECT DISTINCT div_code, sd_code, so_code	
//                 FROM User
//                 WHERE Role_Id = 2
//             )
//             AND du.Status_Id = (
//                 SELECT Status_Id 
//                 FROM DocumentStatusMaster 
//                 WHERE StatusName = 'Pending'
//             );
//         `,
//         [roleId, roleId]
//     );
//     return result;
// };

// export const getPendingDocuments = async (User_Id, roleId) => {
//     try {
//         const [result] = await pool.execute(
//             `
//             SELECT 
//                 du.DocumentId,
//                 du.DocumentName,
//                 dv.FilePath,
//                 du.Account_Id,
//                 du.Status_Id,
//                 du.CreatedByUser_Id
//             FROM 
//                 DocumentUpload du
//             JOIN DocumentVersion dv ON dv.DocumentId = du.DocumentId AND dv.IsLatest = 1
//             JOIN consumer_details cd ON du.Account_Id = cd.account_id
//             JOIN zone_codes zc ON 
//                 TRIM(cd.division) = TRIM(zc.div_code)
//                 AND TRIM(cd.sub_division) = TRIM(zc.sd_code)
//                 AND TRIM(cd.section) = TRIM(zc.so_code)
//             WHERE 
//                 du.Status_Id = 1
//                 AND (zc.div_code, zc.sd_code, zc.so_code) IN (
//                     SELECT div_code, sd_code, so_code 
//                     FROM User 
//                     WHERE Role_Id = ? AND User_Id = ?
//                 )
//                 AND du.CreatedByUser_Id NOT IN (
//                     SELECT User_Id FROM User WHERE Role_Id = 2
//                 );
//             `,
//             [roleId, User_Id]
//         );
//         return result;
//     } catch (error) {
//         console.error("Error fetching pending documents:", error);
//         throw error;
//     }
// };

// export const getApprovedDocuments = async (User_Id, roleId) => {
//     try {
//         const [result] = await pool.execute(
//             `
//             SELECT 
//                 du.DocumentId,
//                 du.DocumentName,
//                 dv.FilePath,  -- from DocumentVersion
//                 du.Account_Id,
//                 u.Email AS UploadedBy,
//                 du.MetaTags,
//                 du.CreatedAt,
//                 du.UpdatedOn,
//                 cd.division,
//                 cd.sub_division,
//                 cd.section,
//                 zc.div_code,
//                 zc.sd_code,
//                 zc.so_code,
//                 dwh.Status_Id,
//                 cd.rr_no,
//                 cd.consumer_name,
//                 cd.consumer_address
//             FROM 
//                 DocumentUpload du
//             JOIN DocumentVersion dv ON dv.DocumentId = du.DocumentId AND dv.IsLatest = 1
//             JOIN consumer_details cd ON du.Account_Id = cd.account_id
//             JOIN zone_codes zc ON 
//                 TRIM(cd.division) = TRIM(zc.div_code)
//                 AND TRIM(cd.sub_division) = TRIM(zc.sd_code)
//                 AND TRIM(cd.section) = TRIM(zc.so_code)
//             JOIN User u ON du.CreatedByUser_Id = u.User_Id
//             JOIN DocumentWorkflowHistory dwh 
//                 ON dwh.DocumentId = du.DocumentId AND dwh.IsLatest = 1
//             WHERE 
//                 dwh.Status_Id = 2  -- 'Approved'
//                 AND (zc.div_code, zc.sd_code, zc.so_code) IN (
//                     SELECT div_code, sd_code, so_code 
//                     FROM User 
//                     WHERE Role_Id = ? AND User_Id = ?
//                 )
//                 AND du.CreatedByUser_Id NOT IN (
//                     SELECT User_Id FROM User WHERE Role_Id = 2
//                 );
//             `,
//             [roleId, User_Id]
//         );
//         return result;
//     } catch (error) {
//         console.error("Error fetching approved documents:", error);
//         throw error;
//     }
// };


// export const getRejectedDocuments = async (User_Id, roleId) => {
//     try {
//         const [result] = await pool.execute(
//             `
//                     SELECT 
//                 drq.Rejection_Id,
//                 drq.DocumentId,
//                 du.DocumentName,
//                 dv.FilePath,  
//                 du.Account_Id,
//                 dv.VersionLabel,
//                 u.Email AS UploadedBy,
//                 ru.Email AS RejectedBy,
//                 drq.RejectedOn,
//                 drq.RejectionComment,
//                 dsm.StatusName,
//                 cd.division,
//                 cd.sub_division,
//                 cd.section,
//                 zc.div_code,
//                 zc.sd_code,
//                 zc.so_code,
//                 drq.IsResolved,
//                 cd.rr_no,
//                 cd.consumer_name,
//                 cd.consumer_address
//             FROM 
//                 DocumentRejectionQueue drq
//             JOIN DocumentUpload du 
//                 ON drq.DocumentId = du.DocumentId
//             JOIN DocumentVersion dv 
//                 ON du.DocumentId = dv.DocumentId 
//             AND dv.IsLatest = 1
//             JOIN User u 
//                 ON drq.UploaderUser_Id = u.User_Id
//             JOIN User ru 
//                 ON drq.RejectedByUser_Id = ru.User_Id
//             JOIN consumer_details cd 
//                 ON du.Account_Id = cd.account_id
//             JOIN zone_codes zc 
//                 ON TRIM(cd.division) = TRIM(zc.div_code)
//             AND TRIM(cd.sub_division) = TRIM(zc.sd_code)
//             AND TRIM(cd.section) = TRIM(zc.so_code)
//             JOIN DocumentStatusMaster dsm 
//                 ON drq.Status_Id = dsm.Status_Id
//             WHERE 
//                 drq.Status_Id = 3  -- Rejected
//                 AND drq.IsResolved = 0 -- ✅ Only unresolved rejections
//                 AND drq.RejectedByUser_Id = ?
//                 AND (zc.div_code, zc.sd_code, zc.so_code) IN (
//                     SELECT div_code, sd_code, so_code 
//                     FROM User 
//                     WHERE Role_Id = ?
//                     AND User_Id = ?
//                 );

//             `,
//             [User_Id, roleId, User_Id]
//         );
//         return result;
//     } catch (error) {
//         console.error("Error fetching rejected documents:", error);
//         throw error;
//     }
// };


// export const getApprovedUpdateDocuments = async (User_Id, roleId, DocumentId) => {
//     try {
//         // ✅ Step 1: Check if user has access to this document
//         const [docMatch] = await pool.execute(
//             `
//             SELECT du.DocumentId
//             FROM DocumentUpload du
//             JOIN consumer_details cd ON du.Account_Id = cd.account_id
//             JOIN zone_codes zc ON 
//                 TRIM(cd.division) = TRIM(zc.div_code)
//                 AND TRIM(cd.sub_division) = TRIM(zc.sd_code)
//                 AND TRIM(cd.section) = TRIM(zc.so_code)
//             JOIN User u ON u.User_Id = ?
//             WHERE du.DocumentId = ?
//               AND zc.div_code = u.div_code
//               AND zc.sd_code = u.sd_code
//               AND zc.so_code = u.so_code
//             `,
//             [User_Id, DocumentId]
//         );

//         if (docMatch.length === 0) {
//             return { success: false, message: "User not authorized to approve this document." };
//         }

//         // Step 2: Update status to Approved (2) in DocumentUpload
//         await pool.execute(
//             `UPDATE DocumentUpload SET Status_Id = 2 WHERE DocumentId = ?`,
//             [DocumentId]
//         );

//         // Step 3: Mark previous workflow history as not latest
//         await pool.execute(
//             `UPDATE DocumentWorkflowHistory SET IsLatest = 0 WHERE DocumentId = ?`,
//             [DocumentId]
//         );

//         // Step 4: Insert new workflow history
//         await pool.execute(
//             `
//             INSERT INTO DocumentWorkflowHistory 
//             (DocumentId, Status_Id, Comment, ActionByUser_Id, ActionByRole_Id, ActionTime, IsLatest)
//             VALUES (?, 2, 'Approved by QC', ?, ?, NOW(), 1)
//             `,
//             [DocumentId, User_Id, roleId]
//         );

//         // Optional: If needed, update DocumentVersion table (currently not required here)

//         return { success: true };
//     } catch (error) {
//         console.error("Approval Error:", error);
//         return { success: false, message: error.message };
//     }
// };



// export const getRejectUpdateDocuments = async (User_Id, roleId, DocumentId, RejectionComment) => {
//     try {
//         // ✅ Step 1: Check if the user is authorized to reject this document (location match)
//         const [docMatch] = await pool.execute(
//             `SELECT dv.DocumentId
//              FROM DocumentVersion dv
//              JOIN DocumentUpload du ON dv.DocumentId = du.DocumentId
//              JOIN consumer_details cd ON du.Account_Id = cd.account_id
//              JOIN zone_codes zc ON 
//                  TRIM(cd.division) = TRIM(zc.div_code)
//                  AND TRIM(cd.sub_division) = TRIM(zc.sd_code)
//                  AND TRIM(cd.section) = TRIM(zc.so_code)
//              JOIN User u ON u.User_Id = ?
//              WHERE dv.DocumentId = ?
//                AND dv.IsLatest = 1
//                AND zc.div_code = u.div_code
//                AND zc.sd_code = u.sd_code
//                AND zc.so_code = u.so_code`,
//             [User_Id, DocumentId]
//         );

//         if (docMatch.length === 0) {
//             return { success: false, message: "User not authorized to reject this document." };
//         }

//         // Step 2: Set previous workflow IsLatest = 0
//         await pool.execute(
//             `UPDATE DocumentWorkflowHistory 
//              SET IsLatest = 0 
//              WHERE DocumentId = ?`,
//             [DocumentId]
//         );

//         // Step 3: Add new entry to workflow table with Rejection status (3)
//         await pool.execute(
//             `INSERT INTO DocumentWorkflowHistory 
//              (DocumentId, Status_Id, Comment, ActionByUser_Id, ActionByRole_Id, ActionTime, IsLatest)
//              VALUES (?, 3, ?, ?, ?, NOW(), 1)`,
//             [DocumentId, RejectionComment, User_Id, roleId]
//         );

//         // Step 4: Get the uploader user ID from DocumentVersion (latest)
//         const [[uploader]] = await pool.execute(
//             `SELECT UploadedByUser_Id 
//              FROM DocumentVersion 
//              WHERE DocumentId = ? AND IsLatest = 1`,
//             [DocumentId]
//         );

//         if (!uploader || !uploader.UploadedByUser_Id) {
//             return { success: false, message: "Uploader not found." };
//         }

//         // Step 5: Insert into rejection queue
//         await pool.execute(
//             `INSERT INTO DocumentRejectionQueue 
//              (DocumentId, RejectedByUser_Id, UploaderUser_Id, Status_Id, RejectionComment)
//              VALUES (?, ?, ?, 3, ?)`,
//             [DocumentId, User_Id, uploader.UploadedByUser_Id, RejectionComment]
//         );

//         return { success: true };
//     } catch (error) {
//         console.error("Rejection Error:", error);
//         return { success: false, message: error.message };
//     }
// };





//this is the fecthing back to the dcouments who uploaded according to the sectionwise 

//==================THIS IS FECTHING BACK APPROVED DOCUMENTS TO THE UPLOADER============================

export const getBackAllApprovedDocumentsCounts = async (so_code, User_Id) => {
    try {
        const [result] = await pool.execute(
            `
            SELECT 
                COUNT(dv.Version_Id) AS ApprovedCount
            FROM 
                documentupload du
            JOIN 
                documentversion dv 
                    ON du.DocumentId = dv.DocumentId 
                    AND dv.Status_Id = 2            
            JOIN 
                documentworkflowhistory wfh 
                    ON dv.Version_Id = wfh.Version_Id 
                    AND wfh.Status_Id = 2           
                        
            WHERE 
                du.so_code = ?                     
                AND du.CreatedByUser_Id = ?;
            `,
            [so_code,User_Id]
        );

        return result;
    } catch (error) {
        console.error("Error fetching approved documents:", error);
        throw error;
    }
};
export const getBackAllApprovedDocuments = async (so_code,User_Id,) => {
    try {
        const [result] = await pool.execute(
            `
                SELECT 
                    -- Document Info
                    du.DocumentId,
                    du.DocumentName,
                    du.DocumentDescription,
                    du.MetaTags,
                    du.Account_Id,
                    du.CreatedByUser_Id,
                    du.CreatedByUserName,
                    du.CreatedAt,
                    du.Category_Id,
                    cat.CategoryName,
                    du.div_code,
                    du.sd_code,
                    du.so_code,

                    -- Version Info
                    dv.Version_Id,
                    dv.VersionLabel,
                    dv.UploadedByUser_Id,
                    dv.UploadedAt,
                    dv.IsLatest,
                    dv.ChangeReason,
                    dv.Status_Id AS VersionStatus_Id,

                    --  Workflow Info (Approved by QC)
                    wfh.Workflow_Id,
                    wfh.ActionByUser_Id AS ApprovedByUser_Id,
                    wfh.ActionTime AS ApprovedOn,
                    wfh.Comment AS ApprovalComment,
                    wfh.Status_Id AS WorkflowStatus_Id,

                    ur.email AS ApprovedbyUserName,

                    -- Consumer Info
                    cd.consumer_name,
                    cd.phone,
                    cd.consumer_address,
                    cd.rr_no,
                    cd.tariff,

                    -- Zone / Division / Subdivision / Section
                    zc.zone,
                    zc.division AS division_name,
                    zc.sub_division AS subdivision_name,
                    zc.section_office AS section_name

                FROM 
                    documentupload du
                JOIN 
                    documentcategorymaster cat ON du.Category_Id = cat.Category_Id
                JOIN 
                    documentversion dv 
                    ON du.DocumentId = dv.DocumentId 
                    AND dv.Status_Id = 2                             
                JOIN 
                    documentworkflowhistory wfh 
                    ON dv.Version_Id = wfh.Version_Id 
                    AND wfh.Status_Id = 2              
                    AND wfh.IsLatest = 1                
                LEFT JOIN 
                    consumer_details cd 
                    ON du.Account_Id = cd.account_id
                LEFT JOIN 
                    zone_codes zc 
                    ON zc.div_code = du.div_code
                    AND zc.sd_code = du.sd_code
                    AND zc.so_code = du.so_code
                LEFT JOIN 
                user ur ON wfh.ActionByUser_Id = ur.User_Id
                WHERE 
                    du.so_code = ?       
                    AND du.CreatedByUser_Id = ?     
                ORDER BY 
                    dv.UploadedAt DESC;

            `,
            [so_code,User_Id]
        );

        return result;
    } catch (error) {
        console.error("Error fetching approved documents:", error);
        throw error;
    }
};
//======================================================================================================
//==================THIS IS FECTHING BACK REJECTED DOCUMENTS TO THE UPLOADER============================
export const getBackAllRejectedDocuments = async (User_Id, so_code) => {
    try {
        const [result] = await pool.execute(
            `
            SELECT 
                du.DocumentId,
                du.DocumentName,
                du.DocumentDescription,
                du.MetaTags,
                du.Account_Id,
                du.CreatedByUser_Id,
                du.CreatedByUserName,
                du.CreatedAt,
                du.Category_Id,
                cat.CategoryName,
                du.div_code,
                du.sd_code,
                du.so_code,

                -- Version Info
                dv.Version_Id,
                dv.VersionLabel,
                dv.UploadedByUser_Id,
                dv.UploadedAt,
                dv.IsLatest,
                dv.ChangeReason,
                dv.Status_Id AS VersionStatus_Id,

                -- Rejection Info
                drq.Rejection_Id,
                drq.Status_Id AS RejectionStatus_Id,
                drq.RejectionComment,
                drq.RejectedOn,
                drq.RejectedByUser_Id,
                drq.UploaderUser_Id,
                drq.IsResolved,

                -- Rejected By User Name
                ur.email AS RejectedByUserName,

                -- Consumer Info
                cd.consumer_name,
                cd.phone,
                cd.consumer_address,
                cd.rr_no,
                cd.tariff,

                -- Zone / Division / Subdivision / Section
                zc.zone,
                zc.division AS division_name,
                zc.sub_division AS subdivision_name,
                zc.section_office AS section_name

            FROM 
                documentrejectionqueue drq
            JOIN 
                documentupload du ON drq.DocumentId = du.DocumentId
            JOIN 
                documentcategorymaster cat ON du.Category_Id = cat.Category_Id
            LEFT JOIN 
                documentversion dv ON drq.Version_Id = dv.Version_Id
            LEFT JOIN 
                consumer_details cd ON du.Account_Id = cd.account_id
            LEFT JOIN 
                zone_codes zc 
                    ON zc.so_code = du.so_code
                    AND zc.sd_code = du.sd_code
                    AND zc.div_code = du.div_code
            LEFT JOIN 
                user ur ON drq.RejectedByUser_Id = ur.User_Id   

            WHERE 
                drq.UploaderUser_Id = ?    
                AND du.so_code = ?           
                AND drq.Status_Id = 3          
                AND drq.IsResolved = 0        

            ORDER BY 
                drq.RejectedOn DESC, 
                dv.UploadedAt DESC;
            `,
            [User_Id, so_code]
        );

        return result;
    } catch (error) {
        console.error("Error fetching rejected documents:", error);
        throw error;
    }
};
export const getBackAllRejectedDocumentsCounts = async (so_code, User_Id) => {
    try {
        const [result] = await pool.execute(
            `
                 
        SELECT 
            COUNT(drq.Version_Id) AS RejectedCount
        FROM 
            documentrejectionqueue drq
        JOIN 
            documentupload du 
            ON drq.DocumentId = du.DocumentId
        WHERE 
            du.so_code = ?
            AND drq.UploaderUser_Id = ?
            AND drq.Status_Id = 3
            AND drq.IsResolved = 0;

            `,
            [so_code, User_Id]
        );
        return result;
    } catch (error) {
        console.error("Error fetching rejected documents:", error);
        throw error;
    }
};
//====================================================================================================
//====================================================================================================

//THIS IS THE FETCHNG THE ALL PEMDIMG COUNTS FOR THE UPLOADER HIS COUNTS OK 
export const getBackAllPendingDocumentsCounts=async(User_Id, so_code)=>{
    try {
        const [result]=await pool.execute(`
            
        SELECT 
            COUNT(DISTINCT dv.Version_Id) AS PendingDocsCount
        FROM 
            documentversion dv
        JOIN 
            documentupload du ON dv.DocumentId = du.DocumentId
        WHERE 
            dv.Status_Id = 1         -- Pending status
            AND isLatest = 1             
            AND dv.UploadedByUser_Id = ?
            AND du.so_code = ?;   -- Replace ? with User_Id
            `, [User_Id, so_code])
            return result
    } catch (error) {
        console.log("Error in fethcing the pending Counts",error)
        throw new Error
    }

}
//===========================================================================================================================
//==============THIS IS THE ALL QC COUNTS WHEN THE So_code SEND ok (Approved, Pending, Rejected)=============================

export const getAllCounts = async (so_code) => {
    try {
        const [result] = await pool.execute(
           `
            SELECT
            -- count distinct versions currently in pending status
            COUNT(DISTINCT CASE WHEN dv.Status_Id = 1 AND dv.IsLatest = 1 THEN dv.Version_Id END) AS PendingCount,

            -- count distinct versions whose latest workflow entry is approved
            COUNT(DISTINCT CASE WHEN dwh.Status_Id = 2 THEN dv.Version_Id END) AS ApprovedCount,

            -- count distinct versions that are rejected either via latest workflow OR unresolved rejection queue
            COUNT(DISTINCT CASE WHEN (dwh.Status_Id = 3 OR drq.Status_Id = 3) THEN dv.Version_Id END) AS RejectedCount

        FROM documentupload du
        JOIN documentversion dv
            ON du.DocumentId = dv.DocumentId
        LEFT JOIN documentworkflowhistory dwh
            ON dv.Version_Id = dwh.Version_Id
            AND dwh.IsLatest = 1
        LEFT JOIN documentrejectionqueue drq
            ON dv.Version_Id = drq.Version_Id
            AND drq.IsResolved = 0
        WHERE du.so_code = ?;
            `,
            [so_code]
        );
        return result;
    } catch (error) {
        console.error("Error fetching ALL documents Counts:", error);
        throw error;
    }
};
// =========================================================================================================

//THIS IS THE CLCIKING PENDING DOCS
export const clickGetPendingDocs = async (so_code) => {
    try {
        const [result] = await pool.execute(
            `
                        SELECT 
                    du.DocumentId,
                    du.DocumentName AS MainDocumentName,
                    du.DocumentDescription AS MainDocumentDescription,
                    du.MetaTags AS MainMetaTags,
                    du.Account_Id,
                    du.CreatedByUser_Id,
                    du.CreatedByUserName,
                    du.Category_Id,
                    du.CreatedAt,
                    du.UpdatedOn,
                    du.div_code,
                    du.sd_code,
                    du.so_code,

                    -- zone names added (no other change)
                    zc.zone AS ZoneName,
                    zc.circle AS CircleName,
                    zc.division AS DivisionName,
                    zc.sub_division AS SubDivisionName,
                    zc.section_office AS SectionOfficeName,

                    c.consumer_name,
                    c.rr_no,
                    c.consumer_address,

                    dv.Version_Id,
                    dv.VersionLabel,
                    dv.UploadedByUser_Id,
                    dv.UploadedAt,
                    dv.IsLatest,
                    dv.ChangeReason,
                    dv.DocumentName AS VersionDocumentName,
                    dv.DocumentDescription AS VersionDocumentDescription,
                    dv.MetaTags AS VersionMetaTags,
                    dv.Status_Id AS VersionStatus_Id

                FROM DocumentUpload du
                JOIN consumer_details c 
                    ON du.Account_Id = c.account_id
                LEFT JOIN documentversion dv 
                    ON du.DocumentId = dv.DocumentId

                -- *** ONLY ADD THIS NEW JOIN ***
                LEFT JOIN zone_codes zc
                    ON du.so_code = zc.so_code

                WHERE dv.Status_Id = 1 AND isLatest = 1  
                AND du.so_code = ?
                ORDER BY du.DocumentId DESC, dv.UploadedAt DESC;

            `,
            [so_code]
        );
        return result;
    } catch (error) {
        console.error("Error fetching ALL Pending Documents:", error);
        throw error;
    }
};

//THIS IS THE CLCIKING Approved DOCS to fecth teh approved docs ok 
export const clickGetApprovedDocs = async (User_Id, so_code) => {
    try {
        const [result] = await pool.execute(
            `
                SELECT 
                    du.DocumentId,
                    du.DocumentName,
                    du.DocumentDescription,
                    du.MetaTags,
                    du.Account_Id,
                    du.CreatedByUser_Id,
                    du.CreatedByUserName,
                    du.Category_Id,

                    -- added zone names
                    zc.zone AS ZoneName,
                    zc.circle AS CircleName,
                    zc.division AS DivisionName,
                    zc.sub_division AS SubDivisionName,
                    zc.section_office AS SectionOfficeName,

                    dv.Version_Id,
                    dwh.ActionByUser_Id,
                    dwh.ActionTime,
                    dwh.Comment,
                    c.consumer_name,
                    c.rr_no,
                    c.consumer_address,

                    dv.uploadedAt AS uploadedAt

                FROM DocumentUpload du
                JOIN DocumentWorkflowHistory dwh 
                    ON du.DocumentId = dwh.DocumentId
                    AND dwh.IsLatest = 1
                    AND dwh.Status_Id = 2           
                JOIN DocumentVersion dv 
                    ON dwh.Version_Id = dv.Version_Id
                    AND dv.Status_Id = 2
                JOIN consumer_details c 
                    ON du.Account_Id = c.account_id

                -- added zone join (only this)
                LEFT JOIN zone_codes zc
                    ON du.so_code = zc.so_code

                WHERE dwh.ActionByUser_Id = ?
                AND du.so_code = ?
                ORDER BY dwh.ActionTime DESC;
            `,
            [User_Id, so_code]
        );
        return result;
    } catch (error) {
        console.error("Error fetching ALL Approved Documents:", error);
        throw error;
    }
};

//THIS IS THE CLCIKING Rejected DOCS
export const clickGetRejectedDocs = async (User_Id, so_code) => {
    try {
        const [result] = await pool.execute(
            `
             SELECT 
                dv.Version_Id,
                dv.DocumentId,
                dv.DocumentName,
                dv.DocumentDescription,
                dv.MetaTags,
                du.Account_Id,
                du.CreatedByUser_Id,
                du.CreatedByUserName,
                du.Category_Id,

                -- added zone names
                zc.zone AS ZoneName,
                zc.circle AS CircleName,
                zc.division AS DivisionName,
                zc.sub_division AS SubDivisionName,
                zc.section_office AS SectionOfficeName,

                drq.Rejection_Id,
                drq.RejectedByUser_Id,
                drq.RejectedOn,
                drq.RejectionComment,
                dv.Version_Id,
                c.consumer_name,
                c.rr_no,
                c.consumer_address,
                dv.uploadedAt AS uploadedAt

            FROM documentrejectionqueue drq
            JOIN documentversion dv 
                ON drq.Version_Id = dv.Version_Id
            JOIN documentupload du 
                ON dv.DocumentId = du.DocumentId
            JOIN consumer_details c 
                ON du.Account_Id = c.account_id

            -- added only this join
            LEFT JOIN zone_codes zc
                ON du.so_code = zc.so_code

            WHERE drq.Status_Id = 3
            AND drq.RejectedByUser_Id = ?
            AND drq.IsResolved = 0
            AND du.so_code = ?
            ORDER BY drq.RejectedOn DESC;
            `,
            [User_Id, so_code]
        );
        return result;
    } catch (error) {
        console.error("Error fetching ALL Rejected Documents:", error);
        throw error;
    }
};



//==========================THIS WHEN WE CLICK TO THE APPROVED BUTTONS THEN IT TO BE APPROVED OK============================
export const clickToApproved = async (User_Id, Version_Id, Role_Id) => {
    try {
        // 1️ Update the specific version status
        await pool.execute(
            `
            UPDATE Documentversion
            SET Status_Id = 2,
                UploadedAt = NOW()
            WHERE Version_Id = ?
            `,
            [Version_Id]
        );

        // 2️ Mark old workflow entries for this version as not latest
        await pool.execute(
            `
            UPDATE DocumentWorkflowHistory
            SET IsLatest = 0
            WHERE Version_Id = ?
            `,
            [Version_Id]
        );

        // 3️ Insert new workflow history row
        const [result] = await pool.execute(
            `
            INSERT INTO DocumentWorkflowHistory
                (DocumentId, Version_Id, Status_Id, Comment, ActionByUser_Id, ActionByRole_Id, ActionTime, IsLatest)
            VALUES
                ((SELECT DocumentId FROM Documentversion WHERE Version_Id = ?), ?, 2, 'Approved by QC', ?, ?, NOW(), 1)
            `,
            [Version_Id, Version_Id, User_Id, Role_Id]
        );

        return { success: true, workflowId: result.insertId };
    } catch (error) {
        console.error("Error approving version:", error);
        throw error;
    }
};

//==========================THIS WHEN WE CLICK TO THE REJECTED BUTTONS THEN IT TO BE REJECTED OK=============================
export const clickToReject = async (User_Id, Version_Id, comment) => {
    try {
        // 1️ Update the specific version status to Rejected
        await pool.execute(
            `
            UPDATE documentversion
            SET Status_Id = 3, UploadedAt = NOW()
            WHERE Version_Id = ?
            `,
            [Version_Id]
        );

        // 2️ Mark old rejection entries for this version as resolved (optional)
        await pool.execute(
            `
            UPDATE documentrejectionqueue
            SET IsResolved = 1
            WHERE Version_Id = ?
            `,
            [Version_Id]
        );

        // 3️ Insert new rejection record for this version
        const [result] = await pool.execute(
            `
            INSERT INTO documentrejectionqueue
                (DocumentId, Version_Id, Status_Id, RejectedByUser_Id, UploaderUser_Id, RejectedOn, RejectionComment, IsResolved)
            VALUES
                (
                    (SELECT DocumentId FROM documentversion WHERE Version_Id = ?),
                    ?, 
                    3, 
                    ?, 
                    (SELECT UploadedByUser_Id FROM documentversion WHERE Version_Id = ?),
                    NOW(),
                    ?,
                    0
                )
            `,
            [Version_Id, Version_Id, User_Id, Version_Id, comment]
        );

        return { success: true, rejectionId: result.insertId };

    } catch (error) {
        console.error("Error rejecting version:", error);
        throw error;
    }
};
// ===================================================================================================================================
// ===================================================================================================================================


