

import { getAllCounts, clickGetPendingDocs, clickGetApprovedDocs, clickGetRejectedDocs, clickToApproved, clickToReject } from "../../models/QcUpload.js"


// export const Qcupload = async (req, res) => {
//     try {
//         const { flagId, roleId, DocumentId, User_Id } = req.body;

//         if (!flagId) {
//             return res.status(400).json({ status: "failed", message: "flagId is required" });
//         }
//         let results
//         if (parseInt(flagId) === 1) {
//             results = await getAllQCDetails(roleId);
//             return res.status(200).json({
//                 status: "success",
//                 message: "All QC Data Fetched Successfully",
//                 count: results.length,
//                 results
//             })
//         }
//         else if (parseInt(flagId) === 3) {
//             results = await getPendingDocuments(User_Id, roleId)
//             return res.status(200).json({
//                 status: "success",
//                 message: "All QC Pending Data Fetched Successfully",
//                 count: results.length,
//                 results
//             })
//         }
//         else if (parseInt(flagId) === 4) {
//             results = await getApprovedDocuments(User_Id, roleId)
//             return res.status(200).json({
//                 status: "success",
//                 message: "All QC Approved Data Fetched Successfully",
//                 count: results.length,
//                 results
//             })
//         }
//         else if (parseInt(flagId) === 5) {
//             results = await getRejectedDocuments(User_Id, roleId)
//             return res.status(200).json({
//                 status: "success",
//                 message: "All QC Rejected Data Fetched Successfully",
//                 count: results.length,
//                 results
//             })
//         }

//         //this is updating the approved button logics when he clicks 
//         else if (parseInt(flagId) === 6) {
//             if (!DocumentId) {
//                 return res.status(400).json({ status: "error", message: "DocumentId is required" });
//             }

//             const result = await getApprovedUpdateDocuments(User_Id, roleId, DocumentId);
//             if (result.success) {
//                 return res.status(200).json({
//                     status: "success",
//                     message: "Document Approved Successfully",
//                 });
//             } else {
//                 return res.status(400).json({
//                     status: "failed",
//                     message: result.message || "Approval failed",
//                 });
//             }
//         }
//         //this is the rejection documents
//         else if (parseInt(flagId) === 7) {
//             if (!DocumentId) {
//                 return res.status(400).json({ status: "error", message: "DocumentId is required" });
//             }

//             const { RejectionComment } = req.body;

//             const result = await getRejectUpdateDocuments(User_Id, roleId, DocumentId, RejectionComment);
//             if (result.success) {
//                 return res.status(200).json({
//                     status: "success",
//                     message: "Document Rejected Successfully",
//                 });
//             } else {
//                 return res.status(400).json({
//                     status: "failed",
//                     message: result.message || "Rejection failed",
//                 });
//             }

//         } else {
//             return res.status(400).json({ status: "failed", message: "Invalid flagId provided" });
//         }

//     } catch (error) {
//         return res.status(500).json({
//             status: "failed",
//             message: "Error fetching QC data",
//             error: error.message
//         });
//     }
// };




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


export const Qcupload = async (req, res) => {
    try {
        const { flagId, User_Id, so_code, DocumentId, Role_Id, comment } = req.body;

        if (!flagId) {
            return res.status(400).json({ status: "failed", message: "flagId is required" });
        }
        // This is flagId will fetch all the pending ,approved and the rejected counts ok 
        let results
        if (parseInt(flagId) === 1) {
            results = await getAllCounts(so_code);
            return res.status(200).json({
                status: "success",
                message: "All QC Data Fetched Successfully",
                results
            })
        }

        //======THIS IS THE WHEN WE CLCIK TO THE PENDING_DOCUMENTS IT FETCHES ALL PENDING DOCUMNETS=============
        else if (parseInt(flagId) === 2) {
            results = await clickGetPendingDocs(so_code)
            return res.status(200).json({
                status: "success",
                message: "All QC Pending Data Fetched Successfully",
                count: results.length,
                results
            })
        }
        //======THIS IS THE WHEN WE CLCIK TO THE APPROVED_DOCUMENTS IT FETCHES ALL APPROVED DOCUMNETS=============
        else if (parseInt(flagId) === 3) {
            results = await clickGetApprovedDocs(User_Id, so_code)
            return res.status(200).json({
                status: "success",
                message: "All QC Approved Data Fetched Successfully",
                count: results.length,
                results
            })
        }
        //======THIS IS THE WHEN WE CLCIK TO THE REJECTED_DOCUMENTS IT FETCHES ALL REJECTED DOCUMNETS=============
        else if (parseInt(flagId) === 4) {
            results = await clickGetRejectedDocs(User_Id, so_code)
            return res.status(200).json({
                status: "success",
                message: "All QC Rejected Data Fetched Successfully",
                count: results.length,
                results
            })
        }

        //======THIS WHEN WE CLCIK TO THE APPROVED BUTTON THEN IT TO BE APPROVED OK=============
        else if (parseInt(flagId) === 5) {
            results = await clickToApproved(User_Id, DocumentId, Role_Id)
            return res.status(200).json({
                status: "success",
                message: "Document Approved Successfully",
            })
        }
        //======THIS WHEN WE CLCIK TO THE Rejected BUTTON THEN IT TO BE REJECTED OK=============
        else if (parseInt(flagId) === 6) {
            results = await clickToReject(User_Id, DocumentId, comment)
            return res.status(200).json({
                status: "success",
                message: "Document Rejected Successfully",
            })
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



