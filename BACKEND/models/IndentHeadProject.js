

import { pool } from "../Config/db.js";
import {getFullIndentNo} from "../utils/IndentPrefix/indent.js"

  //THIS IS THE FETCHING THE APPROVED DOCUMENTS FOR THE PROJECT HEAD HIS CREATED INDENTS_COUNTS=================================
export const fetchApprovedIndentForProjectHeads = async (CreatedByUser_Id) => {
    try {
        const [result] = await pool.execute(`
        
           SELECT 
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
// =====================================================================================================



