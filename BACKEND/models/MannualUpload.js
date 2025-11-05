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
    Status_Id,
    div_code,
    sd_code,
    so_code
) => {
    const query = `
    INSERT INTO documentupload 
    (DocumentName, DocumentDescription, MetaTags, CreatedByUser_Id, CreatedByUserName,
     Account_Id, Role_Id, Category_Id, Status_Id, div_code, sd_code, so_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        Status_Id,
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
export const insertDocumentVersion = async (documentId, versionLabel, filePath, isLatest = 1) => {
    // Set all other versions of this document as not latest
    await pool.execute(`UPDATE documentversion SET IsLatest = 0 WHERE DocumentId = ?`, [documentId]);

    const [result] = await pool.execute(
        `
    INSERT INTO documentversion (DocumentId, VersionLabel, FilePath, IsLatest)
    VALUES (?, ?, ?, ?)
    `,
        [documentId, versionLabel, filePath, isLatest]
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
export const getDocsMetaInfo = async (Account_Id) => {
    try {
        const [result] = await pool.execute(`
            SELECT * FROM documentupload WHERE Account_Id=?;
            `, [Account_Id]);
        return result
    } catch (error) {
        console.log("Error in the fetchig the Details of Document", error)
        throw error
    }
}

    export const getDocsVieww = async (DocumentId) => {
        try {
            const [result] = await pool.execute(`
                    SELECT FilePath FROM documentversion 
                    WHERE DocumentId = ? AND IsLatest = 1 LIMIT 1;
                `, [DocumentId]);
            return result
        } catch (error) {
            console.log("Error in the fetchig the view of Document", error)
            throw error
        }
    }


