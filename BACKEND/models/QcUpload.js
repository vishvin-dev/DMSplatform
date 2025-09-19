import { pool } from "../Config/db.js";

export const getAllQCDetails = async (roleId) => {
    const [result] = await pool.execute(
        `
        SELECT 
            du.DocumentId,
            du.DocumentName,
            dv.FilePath, -- from DocumentVersion,
            dv.VersionLabel,
            du.Account_Id,
            u.Email AS UploadedBy,
            du.MetaTags,
            du.CreatedByUser_Id,
            du.CreatedAt,
            du.UpdatedOn,
            cd.division,
            cd.sub_division,
            cd.section,
            cd.rr_no,
            cd.consumer_name,
            cd.consumer_address
        FROM 
            DocumentUpload du
        JOIN DocumentVersion dv ON dv.DocumentId = du.DocumentId AND dv.IsLatest = 1
        JOIN consumer_details cd 
            ON du.Account_Id = cd.account_id
        JOIN zone_codes zc 
            ON TRIM(cd.division) = TRIM(zc.div_code)
           AND TRIM(cd.sub_division) = TRIM(zc.sd_code)
           AND TRIM(cd.section) = TRIM(zc.so_code)
        JOIN User u 
            ON du.CreatedByUser_Id = u.User_Id
        WHERE 
            du.CreatedByUser_Id NOT IN (
                SELECT User_Id FROM User WHERE Role_Id = 2
            )
            AND (zc.div_code, zc.sd_code, zc.so_code) IN (
                SELECT DISTINCT div_code, sd_code, so_code	
                FROM User
                WHERE Role_Id = 2
            )
            AND du.Status_Id = (
                SELECT Status_Id 
                FROM DocumentStatusMaster 
                WHERE StatusName = 'Pending'
            );
        `,
        [roleId, roleId]
    );
    return result;
};

export const getPendingDocuments = async (User_Id, roleId) => {
    try {
        const [result] = await pool.execute(
            `
            SELECT 
                du.DocumentId,
                du.DocumentName,
                dv.FilePath,
                du.Account_Id,
                du.Status_Id,
                du.CreatedByUser_Id
            FROM 
                DocumentUpload du
            JOIN DocumentVersion dv ON dv.DocumentId = du.DocumentId AND dv.IsLatest = 1
            JOIN consumer_details cd ON du.Account_Id = cd.account_id
            JOIN zone_codes zc ON 
                TRIM(cd.division) = TRIM(zc.div_code)
                AND TRIM(cd.sub_division) = TRIM(zc.sd_code)
                AND TRIM(cd.section) = TRIM(zc.so_code)
            WHERE 
                du.Status_Id = 1
                AND (zc.div_code, zc.sd_code, zc.so_code) IN (
                    SELECT div_code, sd_code, so_code 
                    FROM User 
                    WHERE Role_Id = ? AND User_Id = ?
                )
                AND du.CreatedByUser_Id NOT IN (
                    SELECT User_Id FROM User WHERE Role_Id = 2
                );
            `,
            [roleId, User_Id]
        );
        return result;
    } catch (error) {
        console.error("Error fetching pending documents:", error);
        throw error;
    }
};

export const getApprovedDocuments = async (User_Id, roleId) => {
    try {
        const [result] = await pool.execute(
            `
            SELECT 
                du.DocumentId,
                du.DocumentName,
                dv.FilePath,  -- from DocumentVersion
                du.Account_Id,
                u.Email AS UploadedBy,
                du.MetaTags,
                du.CreatedAt,
                du.UpdatedOn,
                cd.division,
                cd.sub_division,
                cd.section,
                zc.div_code,
                zc.sd_code,
                zc.so_code,
                dwh.Status_Id,
                cd.rr_no,
                cd.consumer_name,
                cd.consumer_address
            FROM 
                DocumentUpload du
            JOIN DocumentVersion dv ON dv.DocumentId = du.DocumentId AND dv.IsLatest = 1
            JOIN consumer_details cd ON du.Account_Id = cd.account_id
            JOIN zone_codes zc ON 
                TRIM(cd.division) = TRIM(zc.div_code)
                AND TRIM(cd.sub_division) = TRIM(zc.sd_code)
                AND TRIM(cd.section) = TRIM(zc.so_code)
            JOIN User u ON du.CreatedByUser_Id = u.User_Id
            JOIN DocumentWorkflowHistory dwh 
                ON dwh.DocumentId = du.DocumentId AND dwh.IsLatest = 1
            WHERE 
                dwh.Status_Id = 2  -- 'Approved'
                AND (zc.div_code, zc.sd_code, zc.so_code) IN (
                    SELECT div_code, sd_code, so_code 
                    FROM User 
                    WHERE Role_Id = ? AND User_Id = ?
                )
                AND du.CreatedByUser_Id NOT IN (
                    SELECT User_Id FROM User WHERE Role_Id = 2
                );
            `,
            [roleId, User_Id]
        );
        return result;
    } catch (error) {
        console.error("Error fetching approved documents:", error);
        throw error;
    }
};


export const getRejectedDocuments = async (User_Id, roleId) => {
    try {
        const [result] = await pool.execute(
            `
                    SELECT 
                drq.Rejection_Id,
                drq.DocumentId,
                du.DocumentName,
                dv.FilePath,  
                du.Account_Id,
                dv.VersionLabel,
                u.Email AS UploadedBy,
                ru.Email AS RejectedBy,
                drq.RejectedOn,
                drq.RejectionComment,
                dsm.StatusName,
                cd.division,
                cd.sub_division,
                cd.section,
                zc.div_code,
                zc.sd_code,
                zc.so_code,
                drq.IsResolved,
                cd.rr_no,
                cd.consumer_name,
                cd.consumer_address
            FROM 
                DocumentRejectionQueue drq
            JOIN DocumentUpload du 
                ON drq.DocumentId = du.DocumentId
            JOIN DocumentVersion dv 
                ON du.DocumentId = dv.DocumentId 
            AND dv.IsLatest = 1
            JOIN User u 
                ON drq.UploaderUser_Id = u.User_Id
            JOIN User ru 
                ON drq.RejectedByUser_Id = ru.User_Id
            JOIN consumer_details cd 
                ON du.Account_Id = cd.account_id
            JOIN zone_codes zc 
                ON TRIM(cd.division) = TRIM(zc.div_code)
            AND TRIM(cd.sub_division) = TRIM(zc.sd_code)
            AND TRIM(cd.section) = TRIM(zc.so_code)
            JOIN DocumentStatusMaster dsm 
                ON drq.Status_Id = dsm.Status_Id
            WHERE 
                drq.Status_Id = 3  -- Rejected
                AND drq.IsResolved = 0 -- ✅ Only unresolved rejections
                AND drq.RejectedByUser_Id = ?
                AND (zc.div_code, zc.sd_code, zc.so_code) IN (
                    SELECT div_code, sd_code, so_code 
                    FROM User 
                    WHERE Role_Id = ?
                    AND User_Id = ?
                );

            `,
            [User_Id, roleId, User_Id]
        );
        return result;
    } catch (error) {
        console.error("Error fetching rejected documents:", error);
        throw error;
    }
};


export const getApprovedUpdateDocuments = async (User_Id, roleId, DocumentId) => {
    try {
        // ✅ Step 1: Check if user has access to this document
        const [docMatch] = await pool.execute(
            `
            SELECT du.DocumentId
            FROM DocumentUpload du
            JOIN consumer_details cd ON du.Account_Id = cd.account_id
            JOIN zone_codes zc ON 
                TRIM(cd.division) = TRIM(zc.div_code)
                AND TRIM(cd.sub_division) = TRIM(zc.sd_code)
                AND TRIM(cd.section) = TRIM(zc.so_code)
            JOIN User u ON u.User_Id = ?
            WHERE du.DocumentId = ?
              AND zc.div_code = u.div_code
              AND zc.sd_code = u.sd_code
              AND zc.so_code = u.so_code
            `,
            [User_Id, DocumentId]
        );

        if (docMatch.length === 0) {
            return { success: false, message: "User not authorized to approve this document." };
        }

        // Step 2: Update status to Approved (2) in DocumentUpload
        await pool.execute(
            `UPDATE DocumentUpload SET Status_Id = 2 WHERE DocumentId = ?`,
            [DocumentId]
        );

        // Step 3: Mark previous workflow history as not latest
        await pool.execute(
            `UPDATE DocumentWorkflowHistory SET IsLatest = 0 WHERE DocumentId = ?`,
            [DocumentId]
        );

        // Step 4: Insert new workflow history
        await pool.execute(
            `
            INSERT INTO DocumentWorkflowHistory 
            (DocumentId, Status_Id, Comment, ActionByUser_Id, ActionByRole_Id, ActionTime, IsLatest)
            VALUES (?, 2, 'Approved by QC', ?, ?, NOW(), 1)
            `,
            [DocumentId, User_Id, roleId]
        );

        // Optional: If needed, update DocumentVersion table (currently not required here)

        return { success: true };
    } catch (error) {
        console.error("Approval Error:", error);
        return { success: false, message: error.message };
    }
};



export const getRejectUpdateDocuments = async (User_Id, roleId, DocumentId, RejectionComment) => {
    try {
        // ✅ Step 1: Check if the user is authorized to reject this document (location match)
        const [docMatch] = await pool.execute(
            `SELECT dv.DocumentId
             FROM DocumentVersion dv
             JOIN DocumentUpload du ON dv.DocumentId = du.DocumentId
             JOIN consumer_details cd ON du.Account_Id = cd.account_id
             JOIN zone_codes zc ON 
                 TRIM(cd.division) = TRIM(zc.div_code)
                 AND TRIM(cd.sub_division) = TRIM(zc.sd_code)
                 AND TRIM(cd.section) = TRIM(zc.so_code)
             JOIN User u ON u.User_Id = ?
             WHERE dv.DocumentId = ?
               AND dv.IsLatest = 1
               AND zc.div_code = u.div_code
               AND zc.sd_code = u.sd_code
               AND zc.so_code = u.so_code`,
            [User_Id, DocumentId]
        );

        if (docMatch.length === 0) {
            return { success: false, message: "User not authorized to reject this document." };
        }

        // Step 2: Set previous workflow IsLatest = 0
        await pool.execute(
            `UPDATE DocumentWorkflowHistory 
             SET IsLatest = 0 
             WHERE DocumentId = ?`,
            [DocumentId]
        );

        // Step 3: Add new entry to workflow table with Rejection status (3)
        await pool.execute(
            `INSERT INTO DocumentWorkflowHistory 
             (DocumentId, Status_Id, Comment, ActionByUser_Id, ActionByRole_Id, ActionTime, IsLatest)
             VALUES (?, 3, ?, ?, ?, NOW(), 1)`,
            [DocumentId, RejectionComment, User_Id, roleId]
        );

        // Step 4: Get the uploader user ID from DocumentVersion (latest)
        const [[uploader]] = await pool.execute(
            `SELECT UploadedByUser_Id 
             FROM DocumentVersion 
             WHERE DocumentId = ? AND IsLatest = 1`,
            [DocumentId]
        );

        if (!uploader || !uploader.UploadedByUser_Id) {
            return { success: false, message: "Uploader not found." };
        }

        // Step 5: Insert into rejection queue
        await pool.execute(
            `INSERT INTO DocumentRejectionQueue 
             (DocumentId, RejectedByUser_Id, UploaderUser_Id, Status_Id, RejectionComment)
             VALUES (?, ?, ?, 3, ?)`,
            [DocumentId, User_Id, uploader.UploadedByUser_Id, RejectionComment]
        );

        return { success: true };
    } catch (error) {
        console.error("Rejection Error:", error);
        return { success: false, message: error.message };
    }
};





//this is the fecthing back to the dcouments who uploaded according to the sectionwise 


export const getBackAllApprovedDocuments = async (User_Id) => {
    try {
        const [result] = await pool.execute(
            `
            SELECT 
                dv.DocumentId,
                dv.Version_Id AS VersionId,
                dv.VersionLabel,
                dv.FilePath,
                du.documentName,
                du.Status_Id,
                wf.ActionTime AS ApprovedOn,
                wf.Comment AS ApprovalComment,
                u.LoginName AS ApprovedBy,
                dsm.StatusName,
                cd.division,
                cd.sub_division,
                cd.section,
                cd.rr_no,                      
                cd.consumer_name,             
                cd.consumer_address 
            FROM 
                DocumentVersion dv
            JOIN DocumentUpload du ON dv.DocumentId = du.DocumentId
            JOIN DocumentWorkflowHistory wf ON dv.DocumentId = wf.DocumentId
            JOIN User u ON wf.ActionByUser_Id = u.User_Id
            JOIN DocumentStatusMaster dsm ON du.Status_Id = dsm.Status_Id
            JOIN consumer_details cd ON du.Account_Id = cd.account_id
            WHERE 
                du.Status_Id = 2                  -- Only Approved documents
                AND dv.IsLatest = 1               -- Only latest version
                AND du.CreatedByUser_Id = ?       -- Uploaded by current user
                AND wf.Status_Id = 2              -- Approved workflow entry
                AND wf.IsLatest = 1               -- Only latest workflow
            `,
            [User_Id]
        );

        return result;
    } catch (error) {
        console.error("Error fetching approved documents:", error);
        throw error;
    }
};


export const getBackAllRejectedDocuments = async (User_Id) => {
    try {
        const [result] = await pool.execute(
            `
                    SELECT 
                drq.Rejection_Id,
                drq.DocumentId,
                du.DocumentName,
                dv.FilePath,  
                du.Account_Id,
                dv.VersionLabel,
                u.Email AS UploadedBy,
                ru.Email AS RejectedBy,
                drq.RejectedOn,
                drq.RejectionComment,
                dsm.StatusName,
                cd.division,
                cd.sub_division,
                cd.section,
                zc.div_code,
                zc.sd_code,
                zc.so_code,
                drq.IsResolved,
                cd.rr_no,
                cd.consumer_name,
                cd.consumer_address
            FROM 
                DocumentRejectionQueue drq
            JOIN DocumentUpload du 
                ON drq.DocumentId = du.DocumentId
            JOIN DocumentVersion dv 
                ON du.DocumentId = dv.DocumentId 
            AND dv.IsLatest = 1
            JOIN User u 
                ON drq.UploaderUser_Id = u.User_Id
            JOIN User ru 
                ON drq.RejectedByUser_Id = ru.User_Id
            JOIN consumer_details cd 
                ON du.Account_Id = cd.account_id
            JOIN zone_codes zc 
                ON TRIM(cd.division) = TRIM(zc.div_code)
            AND TRIM(cd.sub_division) = TRIM(zc.sd_code)
            AND TRIM(cd.section) = TRIM(zc.so_code)
            JOIN DocumentStatusMaster dsm 
                ON drq.Status_Id = dsm.Status_Id
            WHERE 
                drq.Status_Id = 3  -- Rejected
                AND drq.IsResolved = 0  -- ✅ Only unresolved
                AND drq.RejectedByUser_Id = 34
                AND (zc.div_code, zc.sd_code, zc.so_code) IN (
                    SELECT div_code, sd_code, so_code 
                    FROM User 
                    WHERE Role_Id = 2 
                    AND User_Id = 34
                );
            `,
            [User_Id]
        );
        return result;
    } catch (error) {
        console.error("Error fetching rejected documents:", error);
        throw error;
    }
};


export const getBackAllPendingDocuments = async (User_Id) => {
    try {
        const [result] = await pool.execute(
            `
            SELECT 
                dv.DocumentId,
                dv.Version_Id AS VersionId,
                dv.VersionLabel,
                dv.FilePath,
                du.Status_Id,
                dsm.StatusName,
                dv.UploadedAt AS CreatedAt,
                u.LoginName AS UploadedBy,
                cd.division,
                cd.sub_division,
                cd.section,
                cd.rr_no,
                cd.consumer_name,
                cd.consumer_address
            FROM 
                DocumentVersion dv
            JOIN DocumentUpload du ON dv.DocumentId = du.DocumentId
            JOIN DocumentStatusMaster dsm ON du.Status_Id = dsm.Status_Id
            JOIN User u ON du.CreatedByUser_Id = u.User_Id
            JOIN consumer_details cd ON du.Account_Id = cd.account_id
            WHERE 
                du.Status_Id = 1              -- Pending
                AND du.CreatedByUser_Id = ?   -- Uploaded by this user
                AND dv.IsLatest = 1           -- Only the latest version
            `,
            [User_Id]
        );

        return result;
    } catch (error) {
        console.error("Error fetching uploaded user's pending documents:", error);
        throw error;
    }
};












