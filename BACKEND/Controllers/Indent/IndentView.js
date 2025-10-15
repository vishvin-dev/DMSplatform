import { fetchingTheCommonIndentViews, fetchIndentStatus } from "../../models/IndentView.js"

export const IndentView=async(req,res)=>{
     const { flagId, ...data } = req.body;

    try {
        if (!flagId) {
            return res.status(400).json({
                status: "failed",
                message: "flagId is required"
            });
        }
        
//===================THIS IS THE INDENTVIEW SCREEN OOK =======================================


// =====================THIS IS THE SENDING STATUSMASTER========================
        else if (Number(flagId) === 1) {
            const result = await fetchIndentStatus();
            return res.status(200).json({
                message: "IndentStatus fetched Successfully",
                status: "success",
                result
            });
        }
// =============THIS IS THE FETCHING THE COMMON INDENT VIEWS======================================
        else if (Number(flagId) === 2) {
            const result = await fetchingTheCommonIndentViews();
            return res.status(200).json({
                message: "Indent View Fetched Successfully",
                status: "success",
                count:result.length,
                result
            });
        }

// ===================================================================================================================================================
// ===================================================================================================================================================
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