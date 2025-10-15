import { pool } from "../Config/db.js"


// THIS IS THE FETCHING COMMON INDENTVIEWS======================================
export const fetchingTheCommonIndentViews=async()=>{
    try {
        const [result]=await pool.execute(`
                SELECT 
                    i.Indent_Id,
                    i.Indent_No,
                    CONCAT('VTPL/DMS/GESCOM/', YEAR(i.CreatedOn), '/', i.Indent_No) AS fullIndentNo,
                    i.Status_Id,
                    ism.StatusName AS IndentStatus,
                    i.CreatedOn,
                    i.UpdatedOn,
                    i.RequestUserName,

                    -- Creator info
                    u.User_Id AS CreatedByUser_Id,
                    u.FirstName,
                    u.Middlename,
                    u.LastName,
                    r.RoleName AS CreatedByRole,

                    -- Zone mapping
                    GROUP_CONCAT(DISTINCT iz.div_code) AS div_codes,
                    GROUP_CONCAT(DISTINCT iz.sd_code) AS sd_codes,
                    GROUP_CONCAT(DISTINCT iz.so_code) AS so_codes,
                    GROUP_CONCAT(DISTINCT zc.division) AS division_names,
                    GROUP_CONCAT(DISTINCT zc.sub_division) AS subdivision_names,
                    GROUP_CONCAT(DISTINCT zc.section_office) AS section_names,

                    -- Section Qty Details
                    GROUP_CONCAT(DISTINCT CONCAT(isqd.VersionLabel, ':', isqd.EnteredQty)) AS SectionQtyDetails,
                    
                    -- Approval History
                    GROUP_CONCAT(DISTINCT CONCAT('ActionByRole:', iah.Role_Id, '|Status:', iah.Status_Id, '|OOQty:', iah.OOQty, '|PMQty:', iah.PMQty)) AS ApprovalHistory,

                    -- Final Approved
                    fa.FinalApprovedQty,
                    fa.OfficerEnteredQty,
                    fa.ApprovedOn AS FinalApprovedOn,
                    fa.ApprovedByUser_Id AS FinalApprovedByUser,
                    fa.ApprovedByRole_Id AS FinalApprovedByRole,
                    fa.ApprovedFilePath AS FinalApprovedFilePath,

                    -- Rejection Info
                    ri.RejectedComment,
                    ri.RejectedOn,
                    ri.RejectedByRole_Id AS RejectedByRole,
                    ri.UploadedByUser_Id AS RejectedUploadedByUser

                FROM Indent i

                -- Creator info
                JOIN User u ON i.CreatedByUser_Id = u.User_Id
                JOIN Roles r ON i.Role_Id = r.Role_Id

                -- Status name
                LEFT JOIN IndentStatusMaster ism ON i.Status_Id = ism.Status_Id

                -- Zone mapping
                LEFT JOIN IndentZoneMapping iz ON i.Indent_Id = iz.Indent_Id
                LEFT JOIN zone_codes zc ON iz.div_code = zc.div_code AND iz.sd_code = zc.sd_code AND iz.so_code = zc.so_code

                -- Section quantity details
                LEFT JOIN IndentSectionQtyDetail isqd ON i.Indent_Id = isqd.Indent_Id

                -- Approval history
                LEFT JOIN IndentApprovalHistory iah ON i.Indent_Id = iah.Indent_Id

                -- Final PM Approved
                LEFT JOIN FinalApprovedIndent fa ON i.Indent_Id = fa.Indent_Id

                -- Rejections
                LEFT JOIN RejectedIndent ri ON i.Indent_Id = ri.Indent_Id

                GROUP BY i.Indent_Id, i.Indent_No, i.Status_Id, ism.StatusName, i.CreatedOn, i.UpdatedOn, i.RequestUserName, 
                        u.User_Id, u.FirstName, u.Middlename, u.LastName, r.RoleName,
                        fa.FinalApprovedQty, fa.OfficerEnteredQty, fa.ApprovedOn, fa.ApprovedByUser_Id, fa.ApprovedByRole_Id, fa.ApprovedFilePath,
                        ri.RejectedComment, ri.RejectedOn, ri.RejectedByRole_Id, ri.UploadedByUser_Id

                ORDER BY i.CreatedOn DESC;

            `)
            return result
    } catch (error) {
        console.log("The Indent Error")
        throw error
    }
}

//THIS IS THE FETCHING THE INDENTSTATUSMASTER OK ===============================
export const fetchIndentStatus=async()=>{
    try {
        const [result]=await pool.execute(`
                SELECT Status_Id, StatusName
                FROM indentstatusmaster
                ORDER BY Status_Id ASC;
            `)
            return result
    } catch (error) {
        console.log("Error in IndentStatusMaster")
        throw error
    }
}
