

import { pool } from "../Config/db.js";
import { getFullIndentNo } from "../utils/IndentPrefix/indent.js"

//THIS IS THE FETCHING THE APPROVED DOCUMENTS FOR THE PROJECT HEAD HIS CREATED INDENTS_COUNTS=================================
export const fetchApprovedIndentForProjectHeads = async (CreatedByUser_Id) => {
  try {
    // Step 1️: fetch all approved section details with related info
    const [rows] = await pool.execute(`
      SELECT 
        s.SectionQtyDetail_Id,
        s.Indent_Id,
        s.EnteredQty AS OQty,
        s.VersionLabel,
        s.comment AS ApprovalHistoryComment,
        s.UploadedAt,
        s.div_code,
        s.sd_code,
        s.so_code,
        s.Role_Id AS DO_Role_Id,
        i.Indent_No,
        i.Status_Id AS IndentStatus_Id,
        sm.StatusName,
        i.RequestUserName,
        u.User_Id AS CreatedByUser_Id,
        u.FirstName AS CreatedByName,
        r.Role_Id AS SubmitToRole_Id,
        r.RoleName AS SubmitToRole,
        z.division,
        z.sub_division,
        z.section_office
      FROM indentsectionqtydetail s
      JOIN indent i ON s.Indent_Id = i.Indent_Id
      LEFT JOIN user u ON i.CreatedByUser_Id = u.User_Id
      LEFT JOIN roles r ON i.Role_Id = r.Role_Id
      LEFT JOIN indentstatusmaster sm ON i.Status_Id = sm.Status_Id
      LEFT JOIN zone_codes z ON s.div_code = z.div_code 
        AND s.sd_code = z.sd_code 
        AND s.so_code = z.so_code
      WHERE s.Status_Id = 2 AND s.CreatedByUser_Id = ?
      ORDER BY s.Indent_Id, s.SectionQtyDetail_Id
    `, [CreatedByUser_Id]);

    // Step 2️: group sections by Indent_Id
    const indentsMap = {};
    rows.forEach(row => {
      if (!indentsMap[row.Indent_Id]) {
        indentsMap[row.Indent_Id] = {
          Indent_Id: row.Indent_Id,
          Indent_No: row.Indent_No,
          fullIndentNo: getFullIndentNo(row.Indent_No),
          IndentStatus_Id: row.IndentStatus_Id,
          StatusName: row.StatusName,
          RequestUserName: row.RequestUserName,
          CreatedByUser_Id: row.CreatedByUser_Id,
          CreatedByName: row.CreatedByName,
          SubmitToRole_Id: row.SubmitToRole_Id,
          SubmitToRole: row.SubmitToRole,
          VersionLabel: row.VersionLabel,
          UploadedAt: row.UploadedAt,
          //   div_codes: row.div_code,
          //   sd_codes: row.sd_code,
          //   so_codes: row.so_code,
          //   division_names: row.division,
          //   subdivision_names: row.sub_division,
          //   section_names: row.section_office,
          sections: []
        };
      }

      indentsMap[row.Indent_Id].sections.push({
        SectionQtyDetail_Id: row.SectionQtyDetail_Id,
        OQty: row.OQty,
        ApprovalHistoryComment: row.ApprovalHistoryComment,
        div_code: row.div_code,
        sd_code: row.sd_code,
        so_code: row.so_code,
        division_names: row.division,
        subdivision_names: row.sub_division,
        section_names: row.section_office,
        DO_Role_Id: row.DO_Role_Id
      });
    });

    // Step 3️: convert map to array
    return {
      message: "Approved Indent fetched successfully",
      status: "success",
      count: Object.keys(indentsMap).length,
      result: Object.values(indentsMap)
    };

  } catch (error) {
    console.log("Error while fetching approved indent sections:", error);
    throw error;
  }
};


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
            AND s.CreatedByUser_Id = ?;  --  Filter by creator user

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
    // Format Indent_No using getFullIndentNo
    const formattedResult = result.map(row => ({
      ...row,
      fullIndentNo: getFullIndentNo(row.Indent_No)
    }));

    return formattedResult;

  } catch (error) {
    console.log("Error while Fetching The IndentViews", error);
    throw error;
  }
};
//=============================================================================================================================



// ===========================================================================================
//THIS IS THE RESUBMIT THE INDENT QTY FOR THE DO OFFICER AGAIN FROM PROJECT HEAD
// ===========================================================================================

export const resubmittedToOfficerFromPM = async (data) => {
  const {
    Indent_Id,
    ActionByUser_Id,
    Role_Id,      // PM Role
    DO_Role_Id,   // Officer Role
    Status_Id,    // e.g., Resubmitted (4)
    sections
  } = data;

  try {
    const results = [];

    for (const section of sections) {
      const {
        SectionQtyDetail_Id,
        PMQty,
        OOQty,
        ApprovalHistoryComment
      } = section;

      // Step 1️⃣: Insert record in approval history
      const [insertResult] = await pool.execute(
        `
        INSERT INTO IndentApprovalHistory 
          (Indent_Id, SectionQtyDetail_Id, ActionByUser_Id, Role_Id, DO_Role_Id, 
           Status_Id, PMQty, OOQty, ApprovalHistoryComment, ActionOn)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `,
        [
          Indent_Id,
          SectionQtyDetail_Id,
          ActionByUser_Id,
          Role_Id,
          DO_Role_Id,
          Status_Id,
          PMQty || null,
          OOQty || null,
          ApprovalHistoryComment || null,
        ]
      );

      // Step 2️⃣: Update indent master
      await pool.execute(
        `
        UPDATE Indent 
        SET Status_Id = ?, UpdatedOn = NOW() 
        WHERE Indent_Id = ?
        `,
        [Status_Id, Indent_Id]
      );

      // Step 3️⃣: Update section details
      await pool.execute(
        `
        UPDATE IndentSectionQtyDetail 
        SET Status_Id = ?
        WHERE SectionQtyDetail_Id = ?
        `,
        [Status_Id, SectionQtyDetail_Id]
      );

      results.push({
        ApprovalHistory_Id: insertResult.insertId,
        SectionQtyDetail_Id,
        message: "Section resubmitted successfully",
      });
    }

    return results;
  } catch (error) {
    console.error("Error in resubmittedToOfficerFromPM:", error.message);
    throw error;
  }
};

// THIS IS THE FETCHING THE RESUBMITTED INDENTCOUNT OF THE STATUSID=4 FOR THE PROJECT MANAGER OK ======================
export const fetchingResubmittedToOfficerFromPMCount = async (CreatedByUser_Id) => {
  try {
    const [rows] = await pool.execute(`
      SELECT COUNT(DISTINCT ah.Indent_Id) AS totalCount
      FROM IndentApprovalHistory ah
      WHERE ah.Status_Id = 4
        AND ah.ActionByUser_Id = ?
    `, [CreatedByUser_Id]);

    return {
      message: "Resubmitted Indent count fetched successfully",
      status: "success",
      count: rows[0].totalCount
    };

  } catch (error) {
    console.log("Error while fetching resubmitted indent count:", error);
    throw error;
  }
};

// THIS IS THE FETCHING THE RESUBMITTED INDENT OF THE STATUSID=4 FOR THE PROJECT MANAGER OK ======================
export const fetchingResubmittedToOfficerFromPM = async (CreatedByUser_Id) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        ah.ApprovalHistory_Id,
        ah.Indent_Id,
        i.Indent_No,
        i.Status_Id AS IndentStatus_Id,
        sm.StatusName,
        i.RequestUserName,
        u.User_Id AS CreatedByUser_Id,
        u.FirstName AS CreatedByName,
        r.Role_Id AS SubmitToRole_Id,
        r.RoleName AS SubmitToRole,
        ah.SectionQtyDetail_Id,
        ah.ActionByUser_Id,
        ah.Role_Id AS ActionRole_Id,
        ah.DO_Role_Id,
        ah.ActionOn,
        ah.Status_Id AS ApprovalStatus_Id,
        ah.PMQty,
        ah.OOQty,
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
        AND ah.ActionByUser_Id = ?
      ORDER BY ah.Indent_Id, ah.ApprovalHistory_Id
    `, [CreatedByUser_Id]);

    // Group by Indent_Id
    const indentsMap = {};
    rows.forEach(row => {
      if (!indentsMap[row.Indent_Id]) {
        indentsMap[row.Indent_Id] = {
          Indent_Id: row.Indent_Id,
          Indent_No: row.Indent_No,
          fullIndentNo: getFullIndentNo(row.Indent_No),
          IndentStatus_Id: row.IndentStatus_Id,
          StatusName: row.StatusName,
          RequestUserName: row.RequestUserName,
          CreatedByUser_Id: row.CreatedByUser_Id,
          CreatedByName: row.CreatedByName,
          SubmitToRole_Id: row.SubmitToRole_Id,
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
      message: "Resubmitted Indent fetched successfully",
      status: "success",
      count: Object.keys(indentsMap).length,
      result: Object.values(indentsMap)
    };

  } catch (error) {
    console.log("Error while fetching resubmitted indent sections:", error);
    throw error;
  }
};
// ===========================================================================================
// ===========================================================================================