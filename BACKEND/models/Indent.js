
import { pool } from "../Config/db.js"
import { getFullIndentNo } from "../utils/IndentPrefix/indent.js";
//===================THE FLAGID(1,2,3) IS THE FOR FIRST INDENT SCREEN(2Screen) =======================================
// Step 1️ Insert basic Indent (Draft)
export const insertIndentCreation = async (data) => {
    const { CreatedByUser_Id, Role_Id,  zones, Status_Id, RequestUserName } = data;

    // Generate next Indent_No
    const [rows] = await pool.execute(`SELECT MAX(CAST(Indent_No AS UNSIGNED)) AS maxIndent FROM Indent`);
    let nextIndentNo = 1;
    if (rows && rows[0].maxIndent) nextIndentNo = rows[0].maxIndent + 1;
    const formattedIndentNo = String(nextIndentNo).padStart(3, "0");

    // const prefix = "VTPL/DMS/GESCOM/2025-26/";
    const finalIndentNo = getFullIndentNo(formattedIndentNo);

    // Insert into Indent table
    const [result] = await pool.execute(`
        INSERT INTO Indent
        (Indent_No, CreatedByUser_Id, Role_Id, Status_Id, CreatedOn, RequestUserName)
        VALUES (?, ?, ?, ?, NOW(), ?)
    `, [formattedIndentNo, CreatedByUser_Id, Role_Id,  Status_Id || null, RequestUserName]); // Status_Id = 1 (Draft)

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

    return [{ Indent_Id: indentId, Indent_No: formattedIndentNo, fullIndentNo: finalIndentNo }];
}
// Step 2️ Submit Indent (update details + change status to Submitted)
export const submitIndent = async (data) => {
    const { Indent_No,  Status_Id, RequestUserName } = data;

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
        SET 
            Status_Id = ?,
            UpdatedOn = NOW(),
            RequestUserName = ?
        WHERE Indent_Id = ?
    `, [ Status_Id || 2, RequestUserName, indentId]);

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

        return result.map(row => ({
            ...row,
            fullIndentNo: getFullIndentNo(row.Indent_No)
        }));

    } catch (error) {
        console.log("Error while Fetching The IndentViews", error)
    }

}
// =======================================================================================


//=================THIS IS THE WEHN DIV/SUBDIV/SECTION OFFICERS LOGIN BASED ON THE ROLE_ID HIS ASSIGNED INDENT TO BE LOAD (2Screen)======================

export const fetchOfficersAssignedIndent = async (Role_Id) => {
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
                    u.User_Id AS CreatedByIndent,
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
                AND i.Status_Id = 1   -- <<< Only fetch indents with Status_Id = 1
                GROUP BY 
                    i.Indent_Id, i.Indent_No, i.Status_Id, sm.StatusName,
                    i.CreatedOn, i.UpdatedOn, i.RequestUserName,
                    u.User_Id, u.FirstName, u.LastName,
                    r.Role_Id, r.RoleName
                ORDER BY i.CreatedOn DESC;

        `, [Role_Id]);

        return result.map(row => ({
            ...row,
            fullIndentNo: getFullIndentNo(row.Indent_No)
        }));

    } catch (error) {
        console.log("Error while Fetching The IndentViews", error)
    }
}


export const submitOfficerApproveIndent = async (data) => {
    const {
        Indent_Id,
        UploadedByUser_Id,
        Role_Id,
        Status_Id,          // ApprovedByDO / ResubmittedByDO
        sections,           // array of { div_code, sd_code, so_code, EnteredQty, comment }
        CreatedByUser_Id
    } = data;

    if (!Indent_Id || !UploadedByUser_Id || !sections || sections.length === 0) {
        throw new Error("Required data missing");
    }

    // 1️ Determine the next version label
    const [versions] = await pool.execute(
        `SELECT VersionLabel FROM IndentSectionQtyDetail WHERE Indent_Id = ? ORDER BY SectionQtyDetail_Id DESC`,
        [Indent_Id]
    );

    let nextVersion = "v1";
    if (versions.length > 0) {
        const lastVersion = versions[0].VersionLabel;
        const versionNumber = parseInt(lastVersion.replace("v", ""));
        nextVersion = `v${versionNumber + 1}`;
    }

    // 2️ Insert each section
    const insertedRows = [];
    for (const s of sections) {
        const { div_code, sd_code, so_code, EnteredQty, comment } = s;
        const [result] = await pool.execute(
            `INSERT INTO IndentSectionQtyDetail 
            (Indent_Id, VersionLabel, UploadedByUser_Id, UploadedAt, Role_Id, div_code, sd_code, so_code, EnteredQty, Status_Id, comment, CreatedByUser_Id)
            VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
            [Indent_Id, nextVersion, UploadedByUser_Id, Role_Id, div_code, sd_code, so_code, EnteredQty, Status_Id, comment || null, CreatedByUser_Id]
        );

        insertedRows.push({
            SectionQtyDetail_Id: result.insertId,
            Indent_Id,
            VersionLabel: nextVersion,
            div_code,
            sd_code,
            so_code,
            EnteredQty,
            Status_Id,
            comment
        });
    }
    // 3️ Update the main Indent status
   // Hardcode ApprovedByDO status id = 2
const approvedByDOStatus = 2;

await pool.execute(
    `UPDATE Indent
     SET Status_Id = ?
     WHERE Indent_Id = ?`,
    [approvedByDOStatus, Indent_Id]
);



    return insertedRows;
};


//pending 
export const fetchOfficerApproveIndent = async (Role_Id) => {
    try {
        const [result] = await pool.execute(`
            SELECT 
                s.Indent_Id,
                i.Indent_No,
                s.VersionLabel,
                s.UploadedByUser_Id,
                u.FirstName AS UploadedByName,
                s.Role_Id,
                r.RoleName,
                s.Status_Id,
                st.StatusName AS StatusName,
                s.CreatedByUser_Id,
                MIN(s.UploadedAt) AS FirstUploadedAt,
                MAX(s.UploadedAt) AS LastUploadedAt,
                GROUP_CONCAT(
                    CONCAT_WS('-', 
                        s.div_code, 
                        z_div.division, 
                        s.sd_code, 
                        z_sd.sub_division, 
                        s.so_code, 
                        z_so.section_office, 
                        s.EnteredQty, 
                        COALESCE(s.comment,'')
                    ) 
                    ORDER BY s.SectionQtyDetail_Id
                ) AS Sections
            FROM IndentSectionQtyDetail s
            JOIN Indent i ON s.Indent_Id = i.Indent_Id
            JOIN Roles r ON s.Role_Id = r.Role_Id
            JOIN User u ON s.UploadedByUser_Id = u.User_Id
            JOIN IndentStatusMaster st ON s.Status_Id = st.Status_Id
            LEFT JOIN zone_codes z_div ON s.div_code = z_div.div_code
            LEFT JOIN zone_codes z_sd ON s.sd_code = z_sd.sd_code
            LEFT JOIN zone_codes z_so ON s.so_code = z_so.so_code
            WHERE s.Status_Id = 2          -- ApprovedByDO
              AND s.Role_Id = ?            -- single role ID dynamically
            GROUP BY s.Indent_Id, s.VersionLabel, s.UploadedByUser_Id, s.Role_Id, s.Status_Id, st.StatusName, s.CreatedByUser_Id, u.FirstName, r.RoleName, i.Indent_No
            ORDER BY LastUploadedAt DESC;
        `, [Role_Id]);

        return result.map(row => ({
            ...row,
            fullIndentNo: getFullIndentNo(row.Indent_No)
        }));

    } catch (error) {
        console.log("Error while Fetching The IndentViews", error)
    }
}

