import { pool } from "../Config/db.js"


export const getDcoumentsAuditlogs1 = async (searchValue, Role_Id, filterType, filterValue) => {
  try {
    let dateFilter = "";
    let params = [
      `%${searchValue}%`,
      `%${searchValue}%`,
      `%${searchValue}%`,
      Role_Id
    ];

    if (filterType === "weekly") {
      dateFilter = "AND YEARWEEK(dwh.ActionTime, 1) = YEARWEEK(?, 1)";
      params.push(filterValue); // single date
    } else if (filterType === "monthly") {
      dateFilter = "AND MONTH(dwh.ActionTime) = ? AND YEAR(dwh.ActionTime) = ?";
      params.push(filterValue[0], filterValue[1]); // month, year
    } else if (filterType === "datewise") {
      dateFilter = "AND DATE(dwh.ActionTime) = ?";
      params.push(filterValue); // single date
    } else if (filterType === "range") {
      dateFilter = "AND DATE(dwh.ActionTime) BETWEEN ? AND ?";
      params.push(filterValue[0], filterValue[1]); // from, to
    }

    const [rows] = await pool.execute(`
      SELECT 
          cd.id AS ConsumerId,
          cd.rr_no,
          cd.account_id,
          cd.consumer_name,
          cd.consumer_address,
          cd.phone,
          cd.tariff,
          cd.division,
          cd.section,
          cd.sub_division,
          cd.zone,
          cd.circle,

          du.DocumentId,
          du.DocumentName,
          du.DocumentDescription,
          du.MetaTags,
          du.CreatedAt AS DocumentCreatedAt,
          du.CreatedByUserName,
          u1.FirstName AS UploadedByFirstName,
          u1.MiddleName AS UploadedByMiddleName,
          u1.LastName AS UploadedByLastName,
          r.RoleName AS UploaderRole,
          dcm.CategoryName AS DocumentCategory,

          dv.Version_Id,
          dv.VersionLabel,
          dv.FilePath,
          dv.UploadedAt,
          dv.ChangeReason,
          u3.FirstName AS VersionUploadedBy,

          dwh.Workflow_Id,
          dwh.Status_Id,
          dsm.StatusName AS CurrentStatus,
          dwh.Comment AS WorkflowComment,
          dwh.ActionTime,
          u2.FirstName AS ActionByFirstName,
          r2.RoleName AS ActionByRole,

          drq.Rejection_Id,
          drq.RejectionComment,
          drq.RejectedOn,
          u4.FirstName AS RejectedBy,
          u5.FirstName AS OriginalUploader,

          CASE 
            WHEN dwh.Status_Id = 2 THEN 'Approved'
            WHEN dwh.Status_Id = 3 THEN 'Rejected'
            ELSE 'Pending'
          END AS ActionTaken

      FROM DocumentUpload du
      LEFT JOIN consumer_details cd 
          ON du.Account_Id = cd.account_id
      LEFT JOIN DocumentVersion dv 
          ON du.DocumentId = dv.DocumentId
      LEFT JOIN DocumentWorkflowHistory dwh 
          ON du.DocumentId = dwh.DocumentId
      LEFT JOIN DocumentStatusMaster dsm 
          ON dwh.Status_Id = dsm.Status_Id
      LEFT JOIN DocumentRejectionQueue drq 
          ON du.DocumentId = drq.DocumentId
         AND drq.IsResolved = FALSE
      LEFT JOIN User u1 
          ON du.CreatedByUser_Id = u1.User_Id
      LEFT JOIN Roles r 
          ON du.Role_Id = r.Role_Id
      LEFT JOIN User u2 
          ON dwh.ActionByUser_Id = u2.User_Id
      LEFT JOIN Roles r2 
          ON dwh.ActionByRole_Id = r2.Role_Id
      LEFT JOIN User u3 
          ON dv.UploadedByUser_Id = u3.User_Id
      LEFT JOIN User u4 
          ON drq.RejectedByUser_Id = u4.User_Id
      LEFT JOIN User u5 
          ON drq.UploaderUser_Id = u5.User_Id
      LEFT JOIN DocumentCategoryMaster dcm 
          ON du.Category_Id = dcm.Category_Id

      WHERE 1=1
        AND (
              u1.FirstName LIKE ? 
              OR u1.MiddleName LIKE ?
              OR u1.LastName LIKE ?
            )
        AND r.Role_Id = ?
        ${dateFilter}

      ORDER BY 
          cd.account_id, 
          du.DocumentId, 
          dv.UploadedAt DESC, 
          dwh.ActionTime DESC;
    `, params);

    return rows;
  } catch (error) {
    console.error("Error fetching document audit logs:", error);
    throw error;
  }
};

// this is for the using accunt_Id we have to fecth the all audits of the documnets ok 
export const getDocumentsAuditlogsByAccount  = async (account_Id) => {
  try {
    const [rows] = await pool.execute(`
   SELECT 
          cd.id AS ConsumerId,
          cd.rr_no,
          cd.account_id,
          cd.consumer_name,
          cd.consumer_address,
          cd.phone,
          cd.tariff,
          cd.division,
          cd.section,
          cd.sub_division,
          cd.zone,
          cd.circle,

          du.DocumentId,
          du.DocumentName,
          du.DocumentDescription,
          du.MetaTags,
          du.CreatedAt AS DocumentCreatedAt,
          du.CreatedByUserName,
          u1.FirstName AS UploadedByFirstName,
          u1.MiddleName AS UploadedByMiddleName,
          u1.LastName AS UploadedByLastName,
          r.RoleName AS UploaderRole,
          dcm.CategoryName AS DocumentCategory,

          dv.Version_Id,
          dv.VersionLabel,
          dv.FilePath,
          dv.UploadedAt,
          dv.ChangeReason,
          u3.FirstName AS VersionUploadedBy,

          dwh.Workflow_Id,
          dwh.Status_Id,
          dsm.StatusName AS CurrentStatus,
          dwh.Comment AS WorkflowComment,
          dwh.ActionTime,
          u2.FirstName AS ActionByFirstName,
          r2.RoleName AS ActionByRole,

          drq.Rejection_Id,
          drq.RejectionComment,
          drq.RejectedOn,
          u4.FirstName AS RejectedBy,
          u5.FirstName AS OriginalUploader,

          CASE 
            WHEN dwh.Status_Id = 2 THEN 'Approved'
            WHEN dwh.Status_Id = 3 THEN 'Rejected'
            ELSE 'Pending'
          END AS ActionTaken

      FROM DocumentUpload du
      LEFT JOIN consumer_details cd 
          ON du.Account_Id = cd.account_id
      LEFT JOIN DocumentVersion dv 
          ON du.DocumentId = dv.DocumentId
      LEFT JOIN DocumentWorkflowHistory dwh 
          ON du.DocumentId = dwh.DocumentId
      LEFT JOIN DocumentStatusMaster dsm 
          ON dwh.Status_Id = dsm.Status_Id
      LEFT JOIN DocumentRejectionQueue drq 
          ON du.DocumentId = drq.DocumentId
         AND drq.IsResolved = FALSE
      LEFT JOIN User u1 
          ON du.CreatedByUser_Id = u1.User_Id
      LEFT JOIN Roles r 
          ON du.Role_Id = r.Role_Id
      LEFT JOIN User u2 
          ON dwh.ActionByUser_Id = u2.User_Id
      LEFT JOIN Roles r2 
          ON dwh.ActionByRole_Id = r2.Role_Id
      LEFT JOIN User u3 
          ON dv.UploadedByUser_Id = u3.User_Id
      LEFT JOIN User u4 
          ON drq.RejectedByUser_Id = u4.User_Id
      LEFT JOIN User u5 
          ON drq.UploaderUser_Id = u5.User_Id
      LEFT JOIN DocumentCategoryMaster dcm 
          ON du.Category_Id = dcm.Category_Id

      WHERE du.Account_Id = ?

      ORDER BY 
          du.DocumentId, 
          dv.UploadedAt DESC, 
          dwh.ActionTime DESC;
      `, [account_Id]);
    return rows;
  } catch (error) {
    console.error("Error fetching document audit logs:", error);
    throw error;
  }
}



