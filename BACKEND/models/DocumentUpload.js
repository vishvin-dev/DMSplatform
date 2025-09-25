import { pool } from "../Config/db.js";

export const getAccountId = async (section, account_id) => {
  const [result] = await pool.execute(
    `
        SELECT account_id  
        FROM consumer_details 
        WHERE section = ? 
        AND account_id LIKE CONCAT(?, '%') 
        LIMIT 50;
        `,
    [section, account_id]
  );
  return result;
};

export const getConsumerDetails = async (account_id) => {
  const [result] = await pool.execute(
    `
        SELECT account_id, rr_no, consumer_name, consumer_address, phone 
        FROM consumer_details 
        WHERE account_id = ?`,
    [account_id]
  )
  return result
}

export const postFileUpload = async (
  DocumentName,
  DocumentDescription,
  MetaTags,
  FilePath,
  CreatedByUser_Id,
  account_id,
  CreatedByUserName,
  Category_Id,
  Status_Id,
  Role_Id  // New parameter
) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO documentupload 
      (DocumentName, DocumentDescription, MetaTags, FilePath, CreatedByUser_Id, Account_Id, CreatedByUserName, Category_Id, Status_Id, Role_Id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        DocumentName,
        DocumentDescription,
        MetaTags,
        FilePath,
        CreatedByUser_Id,
        account_id,
        CreatedByUserName,
        Category_Id,
        Status_Id,
        Role_Id // New value
      ]
    );
    return result;
  } catch (error) {
    throw error;
  }
};

export const postFileMetaOnly = async (
  DocumentName,
  DocumentDescription,
  MetaTags,
  CreatedByUser_Id,
  account_id,
  CreatedByUserName,
  Category_Id,
  Status_Id,
  Role_Id,
  div_code,   
  sd_code,
  so_code
) => {
  const [result] = await pool.query(
    `INSERT INTO documentupload 
     (DocumentName, DocumentDescription, MetaTags, CreatedByUser_Id, Account_Id, CreatedByUserName, Category_Id, Status_Id, Role_Id, div_code, sd_code, so_code) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [DocumentName, DocumentDescription, MetaTags, CreatedByUser_Id, account_id, CreatedByUserName, Category_Id, Status_Id, Role_Id, div_code, sd_code, so_code]
  );
  return result.insertId; // This is DocumentId
};



//**************************************** */
export const insertDocumentVersion = async (
  DocumentId,
  VersionLabel,
  FilePath,
  UploadedByUser_Id,
  ChangeReason = null
) => {
  const [result] = await pool.query(
    `INSERT INTO documentversion 
     (DocumentId, VersionLabel, FilePath, UploadedByUser_Id, UploadedAt, IsLatest, ChangeReason) 
     VALUES (?, ?, ?, ?, NOW(), 1, ?)`,
    [DocumentId, VersionLabel, FilePath, UploadedByUser_Id, ChangeReason]
  );
  return result.insertId;
};

//===========================reupload documents means edits documents it is =================================/

export const getLatestVersion = async (DocumentId) => {
  const [rows] = await pool.query(
    `SELECT VersionLabel 
         FROM documentversion 
         WHERE DocumentId = ? AND IsLatest = 1 
         LIMIT 1`,
    [DocumentId]
  );
  return rows[0];
};
export const markOldVersionNotLatest = async (DocumentId) => {
  await pool.query(
    `UPDATE documentversion 
         SET IsLatest = 0 
         WHERE DocumentId = ? AND IsLatest = 1`,
    [DocumentId]
  );
};
// Update status directly by Status_Id
export const updateDocumentStatus = async (DocumentId, Status_Id) => {
  await pool.query(
    `UPDATE DocumentUpload SET Status_Id = ? WHERE DocumentId = ?`,
    [Status_Id, DocumentId]
  );
};
// Resolve rejection entry
export const resolveRejection = async (DocumentId) => {
  await pool.query(
    `UPDATE DocumentRejectionQueue SET IsResolved = 1 
         WHERE DocumentId = ? AND IsResolved = 0`,
    [DocumentId]
  );
};
// Helper to calculate new version label
export const getNextVersionLabel = (currentLabel) => {
  const clean = currentLabel.replace(/^v/i, "");
  const parts = clean.split(".");
  if (parts.length === 1) {
    return `v${parts[0]}.1`; // v1 → v1.1
  } else {
    const major = parts[0];
    const minor = parseInt(parts[1], 10) + 1;
    return `v${major}.${minor}`;
  }
};

//****************************************** */





// fetching the status it is
export const getDocumentStatus = async () => {
  const [result] = await pool.execute(
    `
        SELECT Status_Id,StatusName  
        FROM documentstatusmaster 
        `
  );
  return result;
};

export const getDocumentCategory = async () => {
  const [result] = await pool.execute(
    `
        SELECT Category_Id,CategoryName  
        FROM documentcategorymaster 
        `
  );
  return result;
};

// export const getDocumentsView = async (accountId, roleId) => {
//   const [result] = await pool.execute(
//     `
//     SELECT 
//       d.DocumentId,
//       d.DocumentName,
//       d.DocumentDescription,
//       d.MetaTags,
//       d.FilePath,
//       d.CreatedByUser_Id,
//       d.Account_Id,
//       d.CreatedByUserName,
//       d.CreatedAt,
//       d.Category_Id,
//       cat.CategoryName,
//       d.Status_Id,
//       stat.StatusName,
//       d.UpdatedOn,

//       -- Consumer Info
//       cd.consumer_name,
//       cd.phone,
//       cd.consumer_address,
//       cd.rr_no

//     FROM 
//       documentupload d
//     JOIN 
//       documentcategorymaster cat ON d.Category_Id = cat.Category_Id
//     JOIN 
//       documentstatusmaster stat ON d.Status_Id = stat.Status_Id
//     LEFT JOIN 
//       consumer_details cd ON d.Account_Id = cd.account_id
//     WHERE 
//       d.Account_Id = ?
//       AND (d.Role_Id = ? OR d.Role_Id IS NULL)
//     `,
//     [accountId, roleId]
//   );
//   return result;
// };


export const getDocumentsView = async (accountId) => {
  const [result] = await pool.execute(
    `
    SELECT 
      du.DocumentId,
      du.DocumentName,
      du.DocumentDescription,
      du.MetaTags,
      dv.Version_Id,
      dv.VersionLabel,
      dv.FilePath,
      dv.UploadedAt,
      dv.ChangeReason,
      du.Account_Id,
      du.CreatedByUser_Id,
      du.CreatedByUserName,
      du.CreatedAt,
      du.Category_Id,
      cat.CategoryName,
      du.Status_Id,
      stat.StatusName,
      du.UpdatedOn,

      -- Consumer Info
      cd.consumer_name,
      cd.phone,
      cd.consumer_address,
      cd.rr_no

    FROM 
      documentupload du
    JOIN 
      documentcategorymaster cat ON du.Category_Id = cat.Category_Id
    JOIN 
      documentstatusmaster stat ON du.Status_Id = stat.Status_Id
    LEFT JOIN 
      consumer_details cd ON du.Account_Id = cd.account_id
    JOIN 
      documentworkflowhistory wfh ON wfh.DocumentId = du.DocumentId AND wfh.IsLatest = 1
    JOIN 
      documentversion dv ON dv.DocumentId = du.DocumentId AND dv.IsLatest = 1
    WHERE 
      du.Account_Id = ?
      AND wfh.Status_Id = 2 -- Approved
    `,
    [accountId]
  );
  return result;
};

export const getSingleDocumentById = async (documentId) => {
  const [result] = await pool.execute(
    `
        SELECT 
            d.DocumentId,
            d.DocumentName,
            d.DocumentDescription,
            d.MetaTags,

            -- Latest Version Info
            dv.Version_Id,
            dv.VersionLabel,
            dv.FilePath,
            dv.ChangeReason,
            dv.UploadedAt,

            d.CreatedByUser_Id,
            d.Account_Id,
            d.CreatedByUserName,
            d.CreatedAt,
            d.Category_Id,
            cat.CategoryName,
            d.Status_Id,
            stat.StatusName,
            d.UpdatedOn
        FROM 
            documentupload d
        JOIN 
            documentcategorymaster cat ON d.Category_Id = cat.Category_Id
        JOIN 
            documentstatusmaster stat ON d.Status_Id = stat.Status_Id
        JOIN 
            documentversion dv ON dv.DocumentId = d.DocumentId AND dv.IsLatest = 1
        WHERE 
            d.DocumentId = ?
        `,
    [documentId]
  );
  return result;
};




//=========================this is the saving draft documents(partially documents ok )===========================

export const saveDraft = async (
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
) => {
  const [result] = await pool.execute(
    `INSERT INTO documentdraft 
      (DraftName, DraftDescription, MetaTags, Account_Id, FilePath, CreatedByUser_Id, CreatedByUserName, Role_Id, Category_Id, div_code, sd_code, so_code) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      DraftName,
      DraftDescription,
      MetaTags,
      Account_Id,
      FilePath,
      CreatedByUser_Id,
      CreatedByUserName,
      Role_Id || null,
      Category_Id,
      div_code,
      sd_code,
      so_code
    ]
  );

  return result.insertId;
};

export const fetchDraftDocumentByAccountId = async (accountId) => {
  const [result] = await pool.execute(
    `SELECT * 
     FROM documentdraft 
     WHERE Account_Id = ? 
     AND IsFinalized = 0`,
    [accountId]
  );
  return result;
};

// Mark drafts as finalized
export const finalizeDrafts = async (draftIds) => {
    if (!draftIds || draftIds.length === 0) return; // nothing to do

    // Remove undefined/null
    const validIds = draftIds.filter(id => id !== undefined && id !== null);

    if (validIds.length === 0) return;

    const placeholders = validIds.map(() => '?').join(',');
    const sql = `UPDATE documentdraft SET IsFinalized = 1 WHERE Draft_Id IN (${placeholders})`;

    await pool.execute(sql, validIds);
};
//==========================================================================