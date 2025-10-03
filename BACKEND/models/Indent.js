
// import { pool } from "../Config/db.js"
// //===============INDENT===================================

// //==================THIS IS THE INSERTING THE INDNET ZONES AND GENERATING THE INDENT_ID AND INSERTED AUTOMATICALLY=============


// // Step 1️ Insert basic Indent (metadata only, no file yet)
// export const insertIndentCreation = async (data) => {
//     const { CreatedByUser_Id, Role_Id, TotalQty, div_code, sd_code, so_code, Status_Id, RequestUserName } = data;

//     // Get next Indent_No (custom sequence, not auto_increment)
//     const [rows] = await pool.execute(`SELECT MAX(CAST(Indent_No AS UNSIGNED)) AS maxIndent FROM Indent`);
//     let nextIndentNo = 1;
//     if (rows && rows[0].maxIndent) {
//         nextIndentNo = rows[0].maxIndent + 1;
//     }
//     const formattedIndentNo = String(nextIndentNo).padStart(3, "0");

//     // Insert into Indent table
//     const insertSql = `
//         INSERT INTO Indent 
//         (Indent_No, CreatedByUser_Id, Role_Id, TotalQty, div_code, sd_code, so_code, Status_Id, CreatedOn, RequestUserName)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
//     `;

//     const [result] = await pool.execute(insertSql, [
//         formattedIndentNo,
//         CreatedByUser_Id,
//         Role_Id,
//         TotalQty || null,
//         div_code,
//         sd_code,
//         so_code,
//         Status_Id || null,
//         RequestUserName
//     ]);

//     return [{ Indent_Id: result.insertId, Indent_No: formattedIndentNo }];
// };

// // Step 2️ Attach file + update status
// export const updateIndentWithFile = async (data) => {
//     const { Indent_Id, Status_Id, FilePath, UploadedByUser_Id } = data;

//     // 1. Update status in Indent
//     await pool.execute(`UPDATE Indent SET Status_Id = ?, UpdatedOn = NOW() WHERE Indent_Id = ?`, [
//         Status_Id,
//         Indent_Id
//     ]);

//     // 2. Insert into IndentFileVersion (version v1 by default if first file)
//     const [rows] = await pool.execute(
//         `SELECT COUNT(*) AS count FROM IndentFileVersion WHERE Indent_Id = ?`,
//         [Indent_Id]
//     );
//     const versionCount = rows[0].count || 0;
//     const versionLabel = versionCount === 0 ? "v1" : `v${versionCount + 1}`;

//     const insertFileSql = `
//         INSERT INTO IndentFileVersion 
//         (Indent_Id, VersionLabel, FilePath, UploadedByUser_Id, UploadedAt, IsLatest)
//         VALUES (?, ?, ?, ?, NOW(), ?)
//     `;
//     await pool.execute(insertFileSql, [
//         Indent_Id,
//         versionLabel,
//         FilePath,
//         UploadedByUser_Id,
//         1
//     ]);

//     // Mark older versions as not latest
//     await pool.execute(
//         `UPDATE IndentFileVersion SET IsLatest = 0 WHERE Indent_Id = ? AND VersionLabel <> ?`,
//         [Indent_Id, versionLabel]
//     );

//     return [{ Indent_Id, VersionLabel: versionLabel, Status_Id }];
// };

import { pool } from "../Config/db.js"

// Step 1️ Insert basic Indent (Draft)
export const insertIndentCreation = async (data) => {
    const { CreatedByUser_Id, Role_Id, TotalQty, zones, Status_Id, RequestUserName } = data;

    // Generate next Indent_No
    const [rows] = await pool.execute(`SELECT MAX(CAST(Indent_No AS UNSIGNED)) AS maxIndent FROM Indent`);
    let nextIndentNo = 1;
    if (rows && rows[0].maxIndent) nextIndentNo = rows[0].maxIndent + 1;
    const formattedIndentNo = String(nextIndentNo).padStart(3, "0");

    // Insert into Indent table
    const [result] = await pool.execute(`
        INSERT INTO Indent
        (Indent_No, CreatedByUser_Id, Role_Id, TotalQty, Status_Id, CreatedOn, RequestUserName)
        VALUES (?, ?, ?, ?, ?, NOW(), ?)
    `, [formattedIndentNo, CreatedByUser_Id, Role_Id, TotalQty || null, Status_Id || null, RequestUserName]); // Status_Id = 1 (Draft)

    const indentId = result.insertId;

    // Insert multiple zone mappings
    if (zones && zones.length > 0) {
        for (const z of zones) {
            await pool.execute(`
                INSERT INTO IndentZoneMapping (Indent_Id, div_code, sd_code, so_code, CreatedOn)
                VALUES (?, ?, ?, ?, NOW())
            `, [indentId, z.div_code, z.sd_code, z.so_code]);
        }
    }

    return [{ Indent_Id: indentId, Indent_No: formattedIndentNo }];
}

// Step 2️ Submit Indent (update details + change status to Submitted)
export const submitIndent = async (data) => {
    const { Indent_No, TotalQty, Status_Id, RequestUserName } = data;

    // Find internal ID from Indent_No
    const [rows] = await pool.execute(
        `SELECT Indent_Id FROM Indent WHERE Indent_No = ?`,
        [Indent_No]
    );
    if (!rows || rows.length === 0) {
        return { status: "failed", message: "Invalid Indent_No" };
    }
    const indentId = rows[0].Indent_Id;

    // Update using internal Id
    await pool.execute(`
        UPDATE Indent
        SET TotalQty = ?,
            Status_Id = ?,
            UpdatedOn = NOW(),
            RequestUserName = ?
        WHERE Indent_Id = ?
    `, [TotalQty || null, Status_Id || 2, RequestUserName, indentId]);

    return { Indent_No, Status_Id: Status_Id || 2, message: "Indent submitted successfully" };
};

export const fetchCreatedIndenetViews = async (CreatedByUser_Id) => {
    try {
        const [result] = await pool.execute(`
        
            SELECT 
                i.Indent_Id,
                i.Indent_No,
                i.Status_Id,
                sm.StatusName,
                i.CreatedOn,
                i.UpdatedOn,
                i.RequestUserName,
                r.Role_Id,
                r.RoleName AS submitTo,
                u.User_Id,
                GROUP_CONCAT(DISTINCT z.div_code) AS div_codes,
                GROUP_CONCAT(DISTINCT z.sd_code) AS sd_codes,
                GROUP_CONCAT(DISTINCT z.so_code) AS so_codes,
                GROUP_CONCAT(DISTINCT zc.division) AS division_names,
                GROUP_CONCAT(DISTINCT zc.sub_division) AS subdivision_names,
                GROUP_CONCAT(DISTINCT zc.section_office) AS section_names
            FROM Indent i
            JOIN Roles r 
                ON i.Role_Id = r.Role_Id
            JOIN User u 
                ON i.CreatedByUser_Id = u.User_Id
            LEFT JOIN IndentStatusMaster sm 
                ON i.Status_Id = sm.Status_Id
            LEFT JOIN IndentZoneMapping z 
                ON i.Indent_Id = z.Indent_Id
            LEFT JOIN zone_codes zc
                ON z.div_code = zc.div_code 
            AND z.sd_code = zc.sd_code 
            AND z.so_code = zc.so_code
            WHERE i.CreatedByUser_Id = ?
            GROUP BY 
                i.Indent_Id, i.Indent_No, i.Status_Id, sm.StatusName,
                i.CreatedOn, i.UpdatedOn, i.RequestUserName,
                r.Role_Id, r.RoleName,
                u.User_Id
            ORDER BY i.CreatedOn DESC;

        `, [CreatedByUser_Id]);

        return result
    } catch (error) {
        console.log("Error while Fetching The IndentViews", error)
    }

}

export const fetchOfficersAssignedIndent = async (Role_Id) => {
    try {
        const [result] = await pool.execute(`
                 SELECT 
                    i.Indent_Id,
                    i.Indent_No,
                    i.TotalQty,
                    i.Status_Id,
                    sm.StatusName,
                    i.CreatedOn,
                    i.UpdatedOn,
                    i.RequestUserName,
                    u.User_Id,
                    u.FirstName,
                    u.LastName,
                    r.Role_Id,
                    r.RoleName AS submitTo,
                    GROUP_CONCAT(DISTINCT z.div_code) AS div_codes,
                    GROUP_CONCAT(DISTINCT z.sd_code) AS sd_codes,
                    GROUP_CONCAT(DISTINCT z.so_code) AS so_codes,
                    
                    GROUP_CONCAT(DISTINCT zc.division) AS division_names,
                    GROUP_CONCAT(DISTINCT zc.sub_division) AS subdivision_names,
                    GROUP_CONCAT(DISTINCT zc.section_office) AS section_names
                FROM Indent i
                JOIN User u 
                    ON i.CreatedByUser_Id = u.User_Id
                JOIN Roles r 
                    ON i.Role_Id = r.Role_Id
                LEFT JOIN IndentStatusMaster sm 
                    ON i.Status_Id = sm.Status_Id
                LEFT JOIN IndentZoneMapping z 
                    ON i.Indent_Id = z.Indent_Id
                LEFT JOIN zone_codes zc
                    ON z.div_code = zc.div_code 
                AND z.sd_code = zc.sd_code 
                AND z.so_code = zc.so_code
                WHERE i.Role_Id = ?
                GROUP BY 
                    i.Indent_Id, i.Indent_No, i.TotalQty, i.Status_Id, sm.StatusName,
                    i.CreatedOn, i.UpdatedOn, i.RequestUserName,
                    u.User_Id, u.FirstName, u.LastName,
                    r.Role_Id, r.RoleName
                ORDER BY i.CreatedOn DESC;

        `, [Role_Id]);

        return result
    } catch (error) {
        console.log("Error while Fetching The IndentViews", error)
    }
}

// Step 2️ Update indent with file + status (any action)
// export const updateIndentWithFile = async (data) => {
//     const { Indent_Id, Status_Id, FilePath, UploadedByUser_Id } = data;

//     // Update current status in Indent table
//     //this is the updaing the indent table ok
//     await pool.execute(`UPDATE Indent SET Status_Id = ?, UpdatedOn = NOW() WHERE Indent_Id = ?`, [Status_Id, Indent_Id]);

//     // Get current max version for this indent
//     const [rows] = await pool.execute(`SELECT COUNT(*) AS count FROM IndentFileVersion WHERE Indent_Id = ?`, [Indent_Id]);
//     const versionCount = rows[0].count || 0;
//     const versionLabel = `v${versionCount + 1}`;

//     // Insert new version row
//     await pool.execute(`
//         INSERT INTO IndentFileVersion
//         (Indent_Id, VersionLabel, FilePath, UploadedByUser_Id, UploadedAt, IsLatest)
//         VALUES (?, ?, ?, ?, NOW(), 1)
//     `, [Indent_Id, versionLabel, FilePath || null, UploadedByUser_Id]);

//     // Mark all previous versions as not latest
//     await pool.execute(`
//         UPDATE IndentFileVersion SET IsLatest = 0 WHERE Indent_Id = ? AND VersionLabel <> ?
//     `, [Indent_Id, versionLabel]);

//     return { Indent_Id, VersionLabel: versionLabel, Status_Id };
// }

// // Step 3️ Fetch all versions for an indent
// export const fetchIndentVersions = async (Indent_Id) => {
//     const [rows] = await pool.execute(`
//         SELECT VersionLabel, FilePath, UploadedByUser_Id, UploadedAt, IsLatest, i.Status_Id, s.StatusName
//         FROM IndentFileVersion f
//         JOIN Indent i ON f.Indent_Id = i.Indent_Id
//         JOIN IndentStatusMaster s ON i.Status_Id = s.Status_Id
//         WHERE f.Indent_Id = ?
//         ORDER BY f.VersionLabel ASC
//     `, [Indent_Id]);

//     return rows;
// }

