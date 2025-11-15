import { pool } from "../Config/db.js";

export const insertDocumentUpload = async (
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
) => {
    const query = `
    INSERT INTO documentupload 
    (DocumentName, DocumentDescription, MetaTags, CreatedByUser_Id, CreatedByUserName,
     Account_Id, Role_Id, Category_Id, div_code, sd_code, so_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const [result] = await pool.execute(query, [
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
        so_code,
    ]);

    return result.insertId;
};

// ==================================================Get latest version for the document============================================
export const getLatestVersion = async (documentId) => {
    const [rows] = await pool.execute(
        `SELECT VersionLabel FROM documentversion WHERE DocumentId = ? ORDER BY Version_Id DESC LIMIT 1`,
        [documentId]
    );
    return rows.length ? rows[0].VersionLabel : null;
};

// =======================================================Insert new version=========================================================
export const insertDocumentVersion = async (
  documentId,
  versionLabel,
  filePath,
  isLatest = 1,
  changeReason,
  DocumentName,
  DocumentDescription,
  MetaTags,
  Status_Id,
  UploadedByUser_Id
) => {
  // Mark old versions as not latest
  await pool.execute(`UPDATE documentversion SET IsLatest = 0 WHERE DocumentId = ?`, [documentId]);

  // Insert new version
  const [result] = await pool.execute(
    `
    INSERT INTO documentversion 
    (DocumentId, VersionLabel, FilePath, IsLatest, ChangeReason, DocumentName, DocumentDescription, MetaTags, Status_Id, UploadedByUser_Id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      documentId,
      versionLabel,
      filePath,
      isLatest,
      changeReason ?? null,
      DocumentName ?? null,
      DocumentDescription ?? null,
      MetaTags ?? null,
      Status_Id ?? 1,
      UploadedByUser_Id ?? null,
    ]
  );

  return result.insertId;
};



//=================================================Generate next version label (simple v1, v2, v3...)================================
export const getNextVersionLabel = (latestVersion) => {
    if (!latestVersion) return "v1";
    const num = parseInt(latestVersion.replace("v", ""), 10);
    return `v${num + 1}`;
};

//================================================THIS IS THE VIEW OF THE MEAT INFORMATION OK ========================================
export const getDocsMetaInfo = async (accountId) => {
    try {
        const [result] = await pool.execute(`
           SELECT 
                du.DocumentId,
                du.DocumentName,
                du.DocumentDescription,
                du.MetaTags,
                dv.Version_Id,
                dv.VersionLabel,
                dv.IsLatest,
                dv.FilePath,
                dv.UploadedAt,
                dv.ChangeReason,
                du.Account_Id,
                du.CreatedByUser_Id,
                du.CreatedByUserName,
                du.CreatedAt,
                du.Category_Id,
                cat.CategoryName,
                dv.Status_Id AS VersionStatus_Id,  -- Status from version table
                dsm.StatusName AS VersionStatusName,

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
            LEFT JOIN 
                consumer_details cd ON du.Account_Id = cd.account_id
            JOIN 
                documentversion dv ON dv.DocumentId = du.DocumentId AND dv.Status_Id = 2  -- Only approved versions
            LEFT JOIN 
                documentworkflowhistory wfh ON wfh.Version_Id = dv.Version_Id AND wfh.IsLatest = 1  -- Join workflow by version, not document
            LEFT JOIN
                zone_codes zc 
                ON zc.div_code = du.div_code
                AND zc.sd_code = du.sd_code
                AND zc.so_code = du.so_code
                 
            LEFT JOIN 
                documentstatusmaster dsm
                ON dv.Status_Id = dsm.Status_Id
            WHERE 
                du.Account_Id = ?
            ORDER BY
                dv.IsLatest DESC,  -- Latest version first
                dv.UploadedAt DESC;


            `, [accountId]);
        return result
    } catch (error) {
        console.log("Error in the fetchig the Details of Document", error)
        throw error
    }
}

//================================================THIS IS THE DOCUMENT VIEW OK ===========================================
export const getDocsVieww = async (Version_Id) => {
    if (!Version_Id) throw new Error("Version_Id is required"); // safety check

    try {
        const [result] = await pool.execute(`
            SELECT FilePath 
            FROM documentversion 
            WHERE Version_Id = ?;
        `, [Version_Id]); // Use placeholder instead of hardcoded 51

        return result;
    } catch (error) {
        console.log("Error fetching document file:", error);
        throw error;
    }
}



