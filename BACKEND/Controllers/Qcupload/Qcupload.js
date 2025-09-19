

import {
    getAllQCDetails, getPendingDocuments, getApprovedDocuments, getRejectedDocuments, getApprovedUpdateDocuments, getRejectUpdateDocuments
    , getBackAllApprovedDocuments, getBackAllRejectedDocuments, getBackAllPendingDocuments
}
    from "../../models/QcUpload.js"


export const Qcupload = async (req, res) => {
    try {
        const { flagId, roleId, DocumentId, User_Id } = req.body;

        if (!flagId) {
            return res.status(400).json({ status: "failed", message: "flagId is required" });
        }
        let results
        if (parseInt(flagId) === 1) {
            results = await getAllQCDetails(roleId);
            return res.status(200).json({
                status: "success",
                message: "All QC Data Fetched Successfully",
                count: results.length,
                results
            })
        }
        else if (parseInt(flagId) === 3) {
            results = await getPendingDocuments(User_Id, roleId)
            return res.status(200).json({
                status: "success",
                message: "All QC Pending Data Fetched Successfully",
                count: results.length,
                results
            })
        }
        else if (parseInt(flagId) === 4) {
            results = await getApprovedDocuments(User_Id, roleId)
            return res.status(200).json({
                status: "success",
                message: "All QC Approved Data Fetched Successfully",
                count: results.length,
                results
            })
        }
        else if (parseInt(flagId) === 5) {
            results = await getRejectedDocuments(User_Id, roleId)
            return res.status(200).json({
                status: "success",
                message: "All QC Rejected Data Fetched Successfully",
                count: results.length,
                results
            })
        }

        //this is updating the approved button logics when he clicks 
        else if (parseInt(flagId) === 6) {
            if (!DocumentId) {
                return res.status(400).json({ status: "error", message: "DocumentId is required" });
            }

            const result = await getApprovedUpdateDocuments(User_Id, roleId, DocumentId);
            if (result.success) {
                return res.status(200).json({
                    status: "success",
                    message: "Document Approved Successfully",
                });
            } else {
                return res.status(400).json({
                    status: "failed",
                    message: result.message || "Approval failed",
                });
            }
        }
        //this is the rejection documents
        else if (parseInt(flagId) === 7) {
            if (!DocumentId) {
                return res.status(400).json({ status: "error", message: "DocumentId is required" });
            }

            const { RejectionComment } = req.body;

            const result = await getRejectUpdateDocuments(User_Id, roleId, DocumentId, RejectionComment);
            if (result.success) {
                return res.status(200).json({
                    status: "success",
                    message: "Document Rejected Successfully",
                });
            } else {
                return res.status(400).json({
                    status: "failed",
                    message: result.message || "Rejection failed",
                });
            }
            
        } else {
            return res.status(400).json({ status: "failed", message: "Invalid flagId provided" });
        }

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Error fetching QC data",
            error: error.message
        });
    }
};







//This is the verified qc things 
export const verifiedQc = async (req, res) => {
    const { flagId, User_Id } = req.body
    try {
        if (!flagId) {
            return res.status(400).json({ status: "failed", message: "flagId is required" });
        }
        let results

        if (parseInt(flagId) === 1) {
            results = await getBackAllApprovedDocuments(User_Id);
            return res.status(200).json({
                status: "success",
                message: "All QC Approved Data Fetched Successfully",
                count: results.length,
                results
            })
        } else if (parseInt(flagId) === 2) {
            results = await getBackAllRejectedDocuments(User_Id);
            return res.status(200).json({
                status: "success",
                message: "All QC Rejected Data Fetched Successfully",
                count: results.length,
                results
            })
        } else if (parseInt(flagId) === 3) {
            results = await getBackAllPendingDocuments(User_Id);
            return res.status(200).json({
                status: "success",
                message: "All QC Pending Data Fetched Successfully",
                count: results.length,
                results
            });
        }
        else {
            return res.status(400).json({ status: "failed", message: "Invalid flagId provided" });
        }

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Error fetching QC data",
            error: error.message
        });
    }
};




// SELECT 
    //     du.DocumentId,
    //     du.DocumentName,
    //     du.DocumentDescription,
    //     du.MetaTags,
    //     du.Account_Id,
    //     du.CreatedByUser_Id,
    //     du.CreatedByUserName,
    //     du.Status_Id,
    //     du.Category_Id,
    //     du.Role_Id,
    //     du.CreatedAt,
    //     du.UpdatedOn,
    //     u.FirstName,
    //     u.LastName,
    //     u.LoginName,
    //     u.Photo,
    //     u.ProjectName,
    //     u.PhoneNumber,
    //     u.Email
    // FROM DocumentUpload du
    // JOIN User u 
    //     ON du.CreatedByUser_Id = u.User_Id
    // WHERE du.Status_Id = 1
    //   AND EXISTS (
    //         SELECT 1
    //         FROM UserZoneAccess qc
    //         WHERE qc.User_Id = ?
    //           AND qc.so_code = ?
    //       )
    // ORDER BY du.CreatedAt ASC



//     SELECT COUNT(*) AS DocumentCount
// FROM DocumentUpload du
// JOIN User u 
//     ON du.CreatedByUser_Id = u.User_Id
// WHERE du.Status_Id = 1
//   AND EXISTS (
//         SELECT 1
//         FROM UserZoneAccess qc
//         WHERE qc.User_Id = 5
//           AND qc.so_code = 'CHINTAKI'
//       );
