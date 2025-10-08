

import { pool } from "../Config/db.js";
import { getFullIndentNo } from "../utils/IndentPrefix/indent.js"

//THIS IS THE FETCHING THE APPROVED DOCUMENTS FOR THE PROJECT HEAD HIS CREATED INDENTS_COUNTS=================================
export const fetchApprovedIndentForProjectHeads = async (CreatedByUser_Id) => {
    try {
        const [result] = await pool.execute(`
        
           SELECT 
              MAX(s.SectionQtyDetail_Id) AS SectionQtyDetail_Id,
              i.Indent_Id,
              i.Indent_No,
              i.Status_Id,
              sm.StatusName,
              i.CreatedOn AS IndentCreatedOn,
              i.RequestUserName,
              u.User_Id AS CreatedByUser_Id,
              u.FirstName AS CreatedByName,
              r.Role_Id,
              r.RoleName AS SubmitToRole,
              GROUP_CONCAT(DISTINCT z.div_code) AS div_codes,
              GROUP_CONCAT(DISTINCT z.sd_code) AS sd_codes,
              GROUP_CONCAT(DISTINCT z.so_code) AS so_codes,
              GROUP_CONCAT(DISTINCT z.division) AS division_names,
              GROUP_CONCAT(DISTINCT z.sub_division) AS subdivision_names,
              GROUP_CONCAT(DISTINCT z.section_office) AS section_names,
              MAX(s.VersionLabel) AS VersionLabel,
              MAX(s.UploadedAt) AS UploadedAt,
              GROUP_CONCAT(s.EnteredQty) AS EnteredQtys,   -- ✅ comma-separated
              MAX(s.comment) AS comment
          FROM 
              indentsectionqtydetail s
          JOIN indent i 
              ON s.Indent_Id = i.Indent_Id
          LEFT JOIN user u 
              ON s.CreatedByUser_Id = u.User_Id
          LEFT JOIN roles r 
              ON s.Role_Id = r.Role_Id
          LEFT JOIN indentstatusmaster sm 
              ON s.Status_Id = sm.Status_Id
          LEFT JOIN zone_codes z 
              ON s.div_code = z.div_code 
            AND s.sd_code = z.sd_code 
            AND s.so_code = z.so_code
          WHERE 
              s.Status_Id = 2
              AND s.CreatedByUser_Id = ?
          GROUP BY 
              i.Indent_Id, i.Indent_No, i.Status_Id, sm.StatusName,
              i.CreatedOn, i.RequestUserName,
              u.User_Id, u.FirstName,
              r.Role_Id, r.RoleName
          ORDER BY 
              MAX(s.UploadedAt) DESC;

        `, [CreatedByUser_Id]);

        return result.map(row => ({
            ...row,
            fullIndentNo: getFullIndentNo(row.Indent_No),

        }));

    } catch (error) {
        console.log("Error while Fetching The IndentViews", error)
    }

}

//============//THIS IS THE FETCHING THE APPROVED DOCUMENTS FOR THE PROJECT HEAD HIS CREATED INDENTS ALSO THIS OK (IF WE SEPRATE THE CREATOR OF THE INDENT THEN IT IS CHANGE OK )
export const fetchApprovedIndentForProjectHeadCount = async (CreatedByUser_Id) => {
    try {
        const [result] = await pool.execute(`
        
        SELECT 
            COUNT(DISTINCT i.Indent_Id) AS TotalApprovedIndents
        FROM 
            indentsectionqtydetail s
        JOIN indent i 
            ON s.Indent_Id = i.Indent_Id
        WHERE 
            s.Status_Id = 2
            AND s.CreatedByUser_Id = ?;  -- ✅ Filter by creator user

        `, [CreatedByUser_Id]);

        return result
    } catch (error) {
        console.log("Error while Fetching The IndentViews", error)
    }

}

//THIS IS THE FINAL_INDENT APPROVED SUBMISSION IT IS FRO THE PROJECT MANAGER 
export const submitFinalApprovedIndent = async (data) => {
    try {
        const { ApprovedByUser_Id, ApprovedByRole_Id, Status_Id, requestUserName, ApprovedFilePath, sections } = data;

        let insertResults = [];

        // Keep track of Indent_Id(s) to update status later
        const indentIds = new Set();

        // Insert each section into finalapprovedindent
        for (let section of sections) {
            const { SectionQtyDetail_Id, Indent_Id, VersionLabel, div_code, sd_code, so_code, OfficerEnteredQty, FinalApprovedQty } = section;

            const [result] = await pool.execute(`
                INSERT INTO finalapprovedindent
                (Indent_Id, SectionQtyDetail_Id, VersionLabel, div_code, sd_code, so_code, OfficerEnteredQty, FinalApprovedQty, ApprovedByUser_Id, ApprovedByRole_Id, ApprovedFilePath, Status_Id, requestUserName)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                Indent_Id,
                SectionQtyDetail_Id,
                VersionLabel,
                div_code,
                sd_code,
                so_code,
                OfficerEnteredQty,
                FinalApprovedQty,
                ApprovedByUser_Id,
                ApprovedByRole_Id,
                ApprovedFilePath,
                Status_Id,
                requestUserName
            ]);

            insertResults.push({ SectionQtyDetail_Id, insertId: result.insertId });
            indentIds.add(Indent_Id);
        }

        // Update the Indent table and its section details to Status_Id = 3
        for (let id of indentIds) {
            // Update parent indent
            await pool.execute(`UPDATE indent SET Status_Id = 3 WHERE Indent_Id = ?`, [id]);

            // Update all related section details
            await pool.execute(`UPDATE indentsectionqtydetail SET Status_Id = 3 WHERE Indent_Id = ?`, [id]);
        }

        return insertResults;

    } catch (error) {
        console.log("Error submitting final approved indent:", error);
        throw error;
    }
};


// =================================================================================
//THIS IS THE FETCHING THE APPROVED AcknowledgedCount FOR THE PROJECT_MANAGER
export const fetchFinalApprovedIndentCount = async (CreatedByUser_Id) => {
    try {
        const [result] = await pool.execute(`
        
           SELECT 
                COUNT(DISTINCT f.Indent_Id) AS totalCount
            FROM finalapprovedindent f
            LEFT JOIN indent i 
                ON f.Indent_Id = i.Indent_Id
            LEFT JOIN user u 
                ON f.ApprovedByUser_Id = u.User_Id
            LEFT JOIN roles r 
                ON f.ApprovedByRole_Id = r.Role_Id
            LEFT JOIN indentstatusmaster s
                ON f.Status_Id = s.Status_Id
            LEFT JOIN zone_codes z 
                ON f.div_code = z.div_code
                AND f.sd_code = z.sd_code
                AND f.so_code = z.so_code
            WHERE f.ApprovedByUser_Id = ?;
        `, [CreatedByUser_Id]);

        return result
    } catch (error) {
        console.log("Error while Fetching The IndentViews", error)
    }

}

//THIS IS THE FETCHING THE APPROVED Acknowledged FOR THE PROJECT_MANAGER
export const fetchFinalApprovedIndent = async (CreatedByUser_Id) => {
    try {
        const [result] = await pool.execute(`
        
            SELECT 
                f.Indent_Id,
                i.Indent_No,
                GROUP_CONCAT(DISTINCT f.VersionLabel ORDER BY f.VersionLabel ASC) AS VersionLabels,
                GROUP_CONCAT(DISTINCT z.division ORDER BY z.division ASC) AS DivisionNames,
                GROUP_CONCAT(DISTINCT z.sub_division ORDER BY z.sub_division ASC) AS SubDivisionNames,
                GROUP_CONCAT(DISTINCT z.section_office ORDER BY z.section_office ASC) AS SectionNames,
                GROUP_CONCAT(DISTINCT f.div_code ORDER BY f.div_code ASC) AS div_codes,
                GROUP_CONCAT(DISTINCT f.sd_code ORDER BY f.sd_code ASC) AS sd_codes,
                GROUP_CONCAT(DISTINCT f.so_code ORDER BY f.so_code ASC) AS so_codes,
                GROUP_CONCAT(DISTINCT f.OfficerEnteredQty ORDER BY f.SectionQtyDetail_Id ASC) AS OfficerEnteredQtys,
                GROUP_CONCAT(DISTINCT f.FinalApprovedQty ORDER BY f.SectionQtyDetail_Id ASC) AS FinalApprovedQtys,
                f.ApprovedOn,
                f.ApprovedFilePath,
                f.Status_Id,
                s.StatusName AS StatusName,
                f.ApprovedByUser_Id,
                u.FirstName AS ApprovedByName,
                f.ApprovedByRole_Id,
                r.RoleName AS ApprovedByRoleName,
                f.requestUserName
            FROM finalapprovedindent f
            LEFT JOIN indent i 
                ON f.Indent_Id = i.Indent_Id
            LEFT JOIN user u 
                ON f.ApprovedByUser_Id = u.User_Id
            LEFT JOIN roles r 
                ON f.ApprovedByRole_Id = r.Role_Id
            LEFT JOIN indentstatusmaster s
                ON f.Status_Id = s.Status_Id
            LEFT JOIN zone_codes z 
                ON f.div_code = z.div_code
                AND f.sd_code = z.sd_code
                AND f.so_code = z.so_code
            WHERE f.ApprovedByUser_Id = ?
            GROUP BY 
                f.Indent_Id, 
                i.Indent_No, 
                f.ApprovedOn, 
                f.ApprovedFilePath, 
                f.Status_Id, 
                s.StatusName, 
                f.ApprovedByUser_Id, 
                u.FirstName, 
                f.ApprovedByRole_Id, 
                r.RoleName, 
                f.requestUserName
            ORDER BY f.ApprovedOn DESC;

        `, [CreatedByUser_Id]);

        return result
    } catch (error) {
        console.log("Error while Fetching The IndentViews", error)
    }

}
//=============================================================================================================================



