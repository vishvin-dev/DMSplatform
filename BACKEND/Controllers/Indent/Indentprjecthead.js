import { 
    fetchApprovedIndentForProjectHeadCount,
    fetchApprovedIndentForProjectHeads,
    submitFinalApprovedIndent,
    fetchFinalApprovedIndent,
    fetchFinalApprovedIndentCount,
    resubmittedToOfficerFromPM,
    fetchingResubmittedToOfficerFromPMCount,
    fetchingResubmittedToOfficerFromPM,
    fetchingOfficerApprovalPendingCount,
    fetchingOfficerApprovalPending,
    fetchingOfficerRejectedCount,
    fetchingOfficerRejected
} from "../../models/IndentHeadProject.js"

// THIS IS THE PROJECT_HEAD SCREENS OK AND THE VIEW SCREENS OK 
export const IndentProjectHead = async (req, res) => {
    const { flagId, ...data } = req.body;

    try {
        if (!flagId) {
            return res.status(400).json({
                status: "failed",
                message: "flagId is required"
            });
        }
// =============================================================================================================
// THIS IS THE SUBMITTING THE FINAL APPROVED THINGS ALL HERE OK FOR PROJECT HEADOK 
// =============================================================================================================
        //THIS IS THE FETCHING THE APPROVED DOCUMENTS FOR THE PROJECT HEAD HIS CREATED INDENTS_COUNTS===========
        if (Number(flagId) === 1) {
            const result = await fetchApprovedIndentForProjectHeadCount(data.CreatedByUser_Id);
            return res.status(200).json({
                message: "Indent ApprovedCount fetched successfully",
                status: "success",
                result,

            });
        }
        //THIS IS THE FETCHING THE APPROVED DOCUMENTS FOR THE PROJECT HEAD HIS CREATED INDENTS ALSO THIS OK (IF WE SEPRATE THE CREATOR OF THE INDENT THEN IT IS CHANGE OK )
        else if (Number(flagId) === 2) {
            const result = await fetchApprovedIndentForProjectHeads(data.CreatedByUser_Id);
            return res.status(200).json({
                message: "Approved Indent fetched successfully",
                status: "success",
                count: result.length,
                result,

            });
        }

        // THIS IS THE FINAL SUBMIT OF THE INDENT FOR THE PROJECT HEAD IT IS 
         else if (Number(flagId) === 3) {
            // File handled by multer
            if (req.file) data.ApprovedFilePath = req.file.path;

            // sections should be parsed if sent as string
            if (typeof data.sections === "string") {
                data.sections = JSON.parse(data.sections);
            }

            const result = await submitFinalApprovedIndent(data);
            return res.status(200).json({
                message: "Final Indent submitted successfully",
                status: "success",
                count: result.length,
                result
            });
        }

           //THIS IS THE FETCHING THE APPROVED AcknowledgedCount FOR THE PROJECT_MANAGER
         else if (Number(flagId) === 4) {
            const result = await fetchFinalApprovedIndentCount(data.CreatedByUser_Id);
            return res.status(200).json({
                message: "Approved IndentCount fetched successfully",
                status: "success",
                count: result.length,
                result,
            });
        }

         //THIS IS THE FETCHING THE APPROVED Acknowledged FOR THE PROJECT_MANAGER
         else if (Number(flagId) === 5) {
            const result = await fetchFinalApprovedIndent(data.CreatedByUser_Id);
            return res.status(200).json({
                message: "Approved Indent fetched successfully",
                status: "success",
                count: result.length,
                result,
            });
        }
// ===========================================================================================
// ===========================================================================================


// ===========================================================================================
//THIS IS THE RESUBMIT THE INDENT QTY FOR THE DO OFFICER AGAIN FROM PROJECT HEAD 
// ===========================================================================================
        else if (Number(flagId) === 6) {
                    const result = await resubmittedToOfficerFromPM(data);
                    return res.status(200).json({
                        message: "Resbumitted Indent to The Officers successfully",
                        status: "success",
                        count: result.length,
                        result,
                    });
                }

//THIS IS THE FETCHING THE RESUBMITTEDTO OFFICER_COUNT OF THE MANAGER SCREEN =================================
        else if (Number(flagId) === 7) {
                    const result = await fetchingResubmittedToOfficerFromPMCount(data.CreatedByUser_Id);
                    return res.status(200).json({
                        message: "Fetched Resbumitted Indent Count to The Officers successfully",
                        status: "success",
                        count: result.length,
                        result,
                    });
                }
//THIS IS THE FETCHING THE RESUBMITTEDTO OFFICERINFORMATION OF THE MANAGER SCREEN =================================
        else if (Number(flagId) === 8) {
                    const result = await fetchingResubmittedToOfficerFromPM(data.CreatedByUser_Id);
                    return res.status(200).json({
                        message: "Fetched Resbumitted Indent Count to The Officers successfully",
                        status: "success",
                        count: result.length,
                        result,
                    });
                }
// ===========================================================================================
// ===========================================================================================
        else {
            return res.status(400).json({
                status: "failed",
                message: "Invalid flagId"
            });
        }
    } catch (err) {
        console.error("Indent Controller Error:", err);
        return res.status(500).json({
            status: "failed",
            message: "Server error in Indent controller",
            error: err.message
        });
    }
};

//THIS IS THE PROJECTREJECTEDHEAD FETCHING THE OFFICERS REJECTED INDENT TO VIEW FOR THE MANAGER OK (PM) 
export const IndentProjectHeadFecth=async(req,res)=>{
      const { flagId, ...data } = req.body;

    try {
        if (!flagId) {
            return res.status(400).json({
                status: "failed",
                message: "flagId is required"
            });
        }
// =============================================================================================================
// THIS IS THE FETCHING THE OFFICER PENDING APPROVAL AND REJECT SCREEN OK 
// =============================================================================================================
        //THIS IS THE FETCHING THE OFFICER PENDING APPROVALCOUNT ===========
        if (Number(flagId) === 1) {
            const result = await fetchingOfficerApprovalPendingCount();
            return res.status(200).json({
                message: "Indent ApprovedCount fetched successfully",
                status: "success",
                count:[result],

            });
        }
       //THIS IS THE FETCHING THE OFFICER PENDING APPROVAL ===========
        else if (Number(flagId) === 2) {
            const result = await fetchingOfficerApprovalPending();
            return res.status(200).json({
                message: "Pending Approved Indent fetched successfully",
                status: "success",
                count: result.length,
                result,

            });
        }
// =================================================================================================
// =================================================================================================
        //THIS IS THE FETCHING THE OFFICER REJECTEDCOUNT  ===========
        else if (Number(flagId) === 3) {
            const result = await fetchingOfficerRejectedCount();
            return res.status(200).json({
                message: "Pending Rejected Indent fetched successfully",
                status: "success",
                count: [result]
            });
        }

        //THIS IS THE FETCHING THE OFFICER REJECTED  ===========
        else if (Number(flagId) === 4) {
            const result = await fetchingOfficerRejected();
            return res.status(200).json({
                message: "Pending Rejected Indent fetched successfully",
                status: "success",
                count: result.length,
                result,

            });
        }

       
// ===========================================================================================
// ===========================================================================================
        else {
            return res.status(400).json({
                status: "failed",
                message: "Invalid flagId"
            });
        }
    } catch (err) {
        console.error("Indent Controller Error:", err);
        return res.status(500).json({
            status: "failed",
            message: "Server error in Indent controller",
            error: err.message
        });
    }
}