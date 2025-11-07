

import {
    getAllCounts,
    clickGetPendingDocs,
    clickGetApprovedDocs,
    clickGetRejectedDocs,
    clickToApproved,
    clickToReject,
    getBackAllRejectedDocuments
    ,getBackAllApprovedDocuments,
    getBackAllApprovedDocumentsCounts,
    getBackAllRejectedDocumentsCounts
} from "../../models/QcUpload.js"


//This is the verified qc things 
export const verifiedQc = async (req, res) => {
    const { flagId, User_Id, so_code } = req.body
    try {
        if (!flagId) {
            return res.status(400).json({ status: "failed", message: "flagId is required" });
        }
        let results
//==================THIS IS FECTHING BACK APPROVED DOCUMENTS TO THE UPLOADER============================
        if (parseInt(flagId) === 1) {
            results = await  getBackAllApprovedDocumentsCounts( so_code, User_Id);
            return res.status(200).json({
                status: "success",
                message: "All QC Approved Data Fetched Successfully",
                results
            })
        } 
        else if (parseInt(flagId) === 2) {
            results = await getBackAllApprovedDocuments(so_code, User_Id);
            return res.status(200).json({
                status: "success",
                message: "All QC Pending Data Fetched Successfully",
                results
            });
        }
        //==================THIS IS FECTHING BACK REJECTED DOCUMENTS TO THE UPLOADER============================
        else if (parseInt(flagId) === 3) {
            results = await getBackAllRejectedDocumentsCounts(so_code, User_Id);
            return res.status(200).json({
                status: "success",
                message: "All QC Rejected Data Fetched Successfully",
                results
            })
        } 
         else if (parseInt(flagId) === 4) {
            results = await getBackAllRejectedDocuments(User_Id, so_code);
            return res.status(200).json({
                status: "success",
                message: "All QC Rejected Data Fetched Successfully",
                count: results.length,
                results
            })
        } 
        //========================================================================================================
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


//========================THIS IS THE ALL THE QC COMPLETE MODULE==========================================================================================
//========================THIS CONTAINS THE FETCHING THE ALL COUNTS(APPROVED, PENDING, REJECTED),  CLICK TO APPROVED/REJECTED THINGS======================
export const Qcupload = async (req, res) => {
    try {
        const { flagId, User_Id, so_code, Version_Id, Role_Id, comment } = req.body;

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
        //======THIS IS THE WHEN WE CLCIK TO THE APPROVED_DOCUMENTS IT FETCHES ALL HIS APPROVED DOCUMNETS=============
        else if (parseInt(flagId) === 3) {
            results = await clickGetApprovedDocs(User_Id, so_code)
            return res.status(200).json({
                status: "success",
                message: "All QC Approved Data Fetched Successfully",
                count: results.length,
                results
            })
        }
        //======THIS IS THE WHEN WE CLCIK TO THE REJECTED_DOCUMENTS IT FETCHES ALL HIS REJECTED DOCUMNETS=============
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
            results = await clickToApproved(User_Id, Version_Id, Role_Id)
            return res.status(200).json({
                status: "success",
                message: "Document Approved Successfully",
            })
        }
        //======THIS WHEN WE CLCIK TO THE Rejected BUTTON THEN IT TO BE REJECTED OK=============
        else if (parseInt(flagId) === 6) {
            results = await clickToReject(User_Id, Version_Id, comment)
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
//========================================================================================================================================================



