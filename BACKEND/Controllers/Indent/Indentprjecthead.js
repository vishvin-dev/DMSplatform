import { 
    fetchApprovedIndentForProjectHeadCount,
    fetchApprovedIndentForProjectHeads,
    submitFinalApprovedIndent,
    fetchFinalApprovedIndent,
    fetchFinalApprovedIndentCount
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

        //THIS IS THE FETCHING THE APPROVED DOCUMENTS FOR THE PROJECT HEAD HIS CREATED INDENTS_COUNTS=================================
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
// ========================================================================
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
