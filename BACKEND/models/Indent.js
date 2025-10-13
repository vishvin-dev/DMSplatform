
import { pool } from "../Config/db.js"
import { getFullIndentNo } from "../utils/IndentPrefix/indent.js";
//===================THE FLAGID(1,2,3) IS THE FOR FIRST INDENT SCREEN(2Screen) =======================================
// Step 1️ Insert basic Indent (Draft)
export const insertIndentCreation = async (data) => {
    const { CreatedByUser_Id, Role_Id, zones, Status_Id, RequestUserName } = data;

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
    `, [formattedIndentNo, CreatedByUser_Id, Role_Id, Status_Id || null, RequestUserName]); // Status_Id = 1 (Draft)

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
    const { Indent_No, Status_Id, RequestUserName } = data;

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
    `, [Status_Id || 2, RequestUserName, indentId]);

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
export const fetchOfficersAssignedIndentCount = async (Role_Id) => {
    try {
        const [result] = await pool.execute(`
            SELECT 
                COUNT(DISTINCT i.Indent_Id) AS AssignedIndentCount
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
            WHERE 
                i.Role_Id = ?
                AND i.Status_Id = 1;
        `, [Role_Id]);

        return result[0]?.AssignedIndentCount || 0;

    } catch (error) {
        console.log("Error while Fetching Assigned Indent Count", error);
        return 0;
    }
};
//=======================================================================================================

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

    // Step 1️: Check if any version already exists
    const [existingVersions] = await pool.execute(
        `SELECT VersionLabel 
         FROM IndentSectionQtyDetail 
         WHERE Indent_Id = ? 
         ORDER BY SectionQtyDetail_Id DESC`,
        [Indent_Id]
    );

    let nextVersion = "v1";
    let isResubmission = false;

    if (existingVersions.length > 0) {
        const lastVersion = existingVersions[0].VersionLabel;
        const versionNumber = parseInt(lastVersion.replace("v", "")) || 1;
        nextVersion = `v${versionNumber + 1}`;
        isResubmission = true; // means DO is submitting again (second or further time)
    }

    // Step 2️: Insert new section records
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

    // Step 3️: Update main Indent status (ApprovedByDO = 2)
    const approvedByDOStatus = 2;
    await pool.execute(
        `UPDATE Indent
         SET Status_Id = ?
         WHERE Indent_Id = ?`,
        [approvedByDOStatus, Indent_Id]
    );

    // Step 4️: If resubmission (v2 or later), update IndentApprovalHistory status to 4
    if (isResubmission) {
        const resubmittedStatus = 2; // Status_Id = 4 → ResubmittedByDO
        await pool.execute(
            `UPDATE IndentApprovalHistory
             SET Status_Id = ?, 
                 ActionOn = NOW()
             WHERE Indent_Id = ?`,
            [resubmittedStatus, Indent_Id]
        );
    }

    return {
        message: isResubmission
            ? "Indent resubmitted successfully (Version " + nextVersion + ")"
            : "Indent approved by DO successfully (Version v1)",
        status: "success",
        result: insertedRows
    };
};

//============================================================================

// THIS IS THE FETHCING THE APPOROVED INDENT FOR HIS BASED ON THE ROLE_ID OF THE OFFICERS 
export const fetchOfficerApproveIndent = async (Role_Id) => {
    try {
        const [result] = await pool.execute(`
           SELECT 
                i.Indent_Id,
                i.Indent_No,                      
                s.VersionLabel,
                s.UploadedByUser_Id,
                u.FirstName AS UploadedByName,
                s.Role_Id,
                r.RoleName,
                GROUP_CONCAT(DISTINCT s.div_code) AS div_code,
                GROUP_CONCAT(DISTINCT z.division) AS DivisionName,
                GROUP_CONCAT(DISTINCT s.sd_code) AS sd_code,
                GROUP_CONCAT(DISTINCT z.sub_division) AS SubDivisionName,
                GROUP_CONCAT(DISTINCT s.so_code) AS so_code,
                GROUP_CONCAT(DISTINCT z.section_office) AS SectionOfficeName,
                GROUP_CONCAT(DISTINCT s.EnteredQty) AS EnteredQty,
                s.Status_Id,
                sm.StatusName,
                MAX(s.comment) AS comment,
                s.CreatedByUser_Id,
                cu.FirstName AS CreatedByName,
                MAX(s.UploadedAt) AS UploadedAt,
                i.CreatedOn AS IndentCreatedOn,
                i.RequestUserName
            FROM 
                indentsectionqtydetail s
            LEFT JOIN 
                indent i ON s.Indent_Id = i.Indent_Id
            LEFT JOIN 
                user u ON s.UploadedByUser_Id = u.User_Id
            LEFT JOIN 
                user cu ON s.CreatedByUser_Id = cu.User_Id
            LEFT JOIN 
                roles r ON s.Role_Id = r.Role_Id
            LEFT JOIN 
                indentstatusmaster sm ON s.Status_Id = sm.Status_Id
            LEFT JOIN 
                zone_codes z 
                ON s.div_code = z.div_code 
                AND s.sd_code = z.sd_code 
                AND s.so_code = z.so_code
            WHERE 
                s.Status_Id = 2
                AND s.Role_Id = ?
            GROUP BY 
                i.Indent_Id, 
                i.Indent_No, 
                s.VersionLabel, 
                s.UploadedByUser_Id,
                s.Role_Id,
                s.Status_Id,
                sm.StatusName,
                s.CreatedByUser_Id,
                cu.FirstName,
                i.CreatedOn,
                i.RequestUserName,
                u.FirstName,
                r.RoleName
            ORDER BY 
                MAX(s.UploadedAt) DESC;
        `, [Role_Id]);

        return result.map(row => ({
            ...row,
            fullIndentNo: getFullIndentNo(row.Indent_No)
        }));

    } catch (error) {
        console.log("Error while Fetching The IndentViews", error)
    }
}

export const fetchOfficerApproveIndentCount = async (Role_Id) => {
    try {
        const [result] = await pool.execute(`
            SELECT COUNT(DISTINCT s.Indent_Id) AS totalCount
            FROM indentsectionqtydetail s
            LEFT JOIN indent i ON s.Indent_Id = i.Indent_Id
            LEFT JOIN user u ON s.UploadedByUser_Id = u.User_Id
            LEFT JOIN user cu ON s.CreatedByUser_Id = cu.User_Id
            LEFT JOIN roles r ON s.Role_Id = r.Role_Id
            LEFT JOIN indentstatusmaster sm ON s.Status_Id = sm.Status_Id
            LEFT JOIN zone_codes z 
                ON s.div_code = z.div_code 
               AND s.sd_code = z.sd_code 
               AND s.so_code = z.so_code
            WHERE 
                s.Status_Id = 2
                AND s.Role_Id = ?
        `, [Role_Id]);

        return result[0].totalCount; // returns just the count as a number

    } catch (error) {
        console.log("Error while fetching the indent count", error);
        return 0;
    }
}

//=====================================================================================



//==================================================================================
//  THIS IS THE INDENT RSUBMITTED SCREEN OK (OFFCIERS SCREEN)
//THIS IS THE INDENT RESUBMITTED INDENT COUNT FETCHED HERE OK FOR THE OFFICERS SCREEN OK 
export const fetchingResubmittedIndentsCountByDORole = async (DO_Role_Id) => {
    try {
        const [rows] = await pool.execute(`
      SELECT COUNT(DISTINCT ah.Indent_Id) AS totalResubmittedIndents
      FROM IndentApprovalHistory ah
      JOIN IndentSectionQtyDetail s 
        ON ah.SectionQtyDetail_Id = s.SectionQtyDetail_Id
      WHERE ah.Status_Id = 4
        AND ah.DO_Role_Id = ?
    `, [DO_Role_Id]);

        return {
            message: "Resubmitted Indent count fetched successfully",
            status: "success",
            count: rows[0].totalResubmittedIndents
        };

    } catch (error) {
        console.log("Error while fetching resubmitted indent count:", error);
        throw error;
    }
};

//THIS IS THE INDENT RESUBMITTED INDENTINFORMATION FETCHED HERE OK FOR THE OFFICERS SCREEN OK 
export const fetchingResubmittedIndentsByDORole = async (DO_Role_Id) => {
    try {
        const [rows] = await pool.execute(`
      SELECT 
        ah.ApprovalHistory_Id,
        ah.Indent_Id,
        i.Indent_No,
        i.Status_Id AS IndentStatus_Id,
        sm.StatusName AS IndentStatusName,
        i.RequestUserName,
        u.User_Id AS CreatedByIndent,
        u.FirstName AS CreatedByName,
        r.RoleName AS SubmitToRole,
        ah.SectionQtyDetail_Id,
        ah.ActionByUser_Id,
        ah.Role_Id AS ActionRole_Id,
        ah.DO_Role_Id,
        ah.ActionOn,
        ah.Status_Id AS ApprovalStatus_Id,
        ah.PMQty,
        ah.OOQty AS OOQty,
        ah.ApprovalHistoryComment,
        s.div_code,
        s.sd_code,
        s.so_code,
        z.division,
        z.sub_division,
        z.section_office
      FROM IndentApprovalHistory ah
      JOIN Indent i ON ah.Indent_Id = i.Indent_Id
      LEFT JOIN User u ON i.CreatedByUser_Id = u.User_Id
      LEFT JOIN Roles r ON i.Role_Id = r.Role_Id
      LEFT JOIN IndentStatusMaster sm ON i.Status_Id = sm.Status_Id
      LEFT JOIN IndentSectionQtyDetail s ON ah.SectionQtyDetail_Id = s.SectionQtyDetail_Id
      LEFT JOIN zone_codes z 
        ON s.div_code = z.div_code
        AND s.sd_code = z.sd_code
        AND s.so_code = z.so_code
      WHERE ah.Status_Id = 4
        AND ah.DO_Role_Id = ?
      ORDER BY ah.Indent_Id, ah.ApprovalHistory_Id
    `, [DO_Role_Id]);

        // Group by Indent_Id
        const indentsMap = {};
        rows.forEach(row => {
            if (!indentsMap[row.Indent_Id]) {
                indentsMap[row.Indent_Id] = {
                    Indent_Id: row.Indent_Id,
                    Indent_No: row.Indent_No,
                    fullIndentNo: getFullIndentNo(row.Indent_No),
                    IndentStatus_Id: row.IndentStatus_Id,
                    IndentStatusName: row.IndentStatusName,
                    RequestUserName: row.RequestUserName,
                    CreatedByUser_Id: row.CreatedByUser_Id,
                    CreatedByName: row.CreatedByName,
                    SubmitToRole: row.SubmitToRole,
                    sections: []
                };
            }

            indentsMap[row.Indent_Id].sections.push({
                SectionQtyDetail_Id: row.SectionQtyDetail_Id,
                PMQty: row.PMQty,
                OOQty: row.OOQty,
                ApprovalHistoryComment: row.ApprovalHistoryComment,
                ActionByUser_Id: row.ActionByUser_Id,
                ActionRole_Id: row.ActionRole_Id,
                DO_Role_Id: row.DO_Role_Id,
                ActionOn: row.ActionOn,
                div_code: row.div_code,
                sd_code: row.sd_code,
                so_code: row.so_code,
                division_names: row.division,
                subdivision_names: row.sub_division,
                section_names: row.section_office
            });
        });

        return {
            message: "Resubmitted indents fetched successfully",
            status: "success",
            count: Object.keys(indentsMap).length,
            result: Object.values(indentsMap)
        };

    } catch (error) {
        console.error("Error fetching resubmitted indents:", error);
        throw error;
    }
};
//==================================================================================
//==================================================================================