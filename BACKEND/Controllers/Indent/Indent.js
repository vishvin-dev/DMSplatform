
import { 
    insertIndentCreation,
    submitIndent, 
    fetchCreatedIndenetViews,
    fetchOfficersAssignedIndent,
    submitOfficerApproveIndent,
    fetchOfficerApproveIndent,
    fetchOfficersAssignedIndentCount,
    fetchOfficerApproveIndentCount
} from "../../models/Indent.js";

export const Indent = async (req, res) => {
    const { flagId, ...data } = req.body;

    try {
        if (!flagId) {
            return res.status(400).json({
                status: "failed",
                message: "flagId is required"
            });
        }
        //===================THE FLAGID(1,2,3) IS THE FOR FIRST INDENT SCREEN =======================================
        // 1️ Create new Indent (with auto-generated Indent_No)
        if (Number(flagId) === 1) {
            const result = await insertIndentCreation(data);
            return res.status(200).json({
                message: "Indent created successfully",
                status: "success",
                result
            });
        }

        // submit that indent_No with satusid to update ok 
        else if (Number(flagId) === 2) {
            const result = await submitIndent(data);
            return res.status(200).json({
                message: "Indent submitted successfully",
                status: "success",
                result
            });
        }
       
        // 2️ Fetch Indent Views (for dashboard / listing)
        else if (Number(flagId) === 3) {
            const result = await fetchCreatedIndenetViews(data.CreatedByUser_Id);
            return res.status(200).json({
                message: "Indent Views Fetched successfully",
                status: "success",
                count:result.length,
                result
            });
        }
        //=======================================================================================================================
        //Invalid flag





        //=================THIS IS THE WEHN DIV/SUBDIV/SECTION OFFICERS LOGIN BASED ON THE ROLE_ID HIS ASSIGNED INDENT TO BE LOAD 
        else if (Number(flagId) === 4) {
            const result = await fetchOfficersAssignedIndent(data.Role_Id);
            return res.status(200).json({
                message: "Indent Views Fetched successfully",
                status: "success",
                count:result.length,
                result
            });
        }

        else if (Number(flagId) === 7) {
            const result = await fetchOfficersAssignedIndentCount(data.Role_Id);
            return res.status(200).json({
                message: "Indent Count Views Fetched successfully",
                status: "success",
                count:result.length,
                result
            });
        }

         //===============THIS IS THE WHEN THE OFFICERS SUBMIT THE APPROVED IDNENT MEANS FIRST TIME ENTERS THE APPROVED INDENT ==================================
         else if (Number(flagId) === 5) {
            const result = await submitOfficerApproveIndent(data);
            return res.status(200).json({
                message: "Indent Submited successfully",
                status: "success",
                count:result.length,
                result
            });
        }


        // ==========================THIS IS THE APPROVED IDENT IS FETCHED BASED ON THE USERID OK 

         else if (Number(flagId) === 6) {
            const result = await fetchOfficerApproveIndent(data.Role_Id);
            return res.status(200).json({
                message: "Indent Fetched successfully",
                status: "success",
                count:result.length,
                result
            });
        }

         else if (Number(flagId) === 8) {
            const result = await fetchOfficerApproveIndentCount(data.Role_Id);
            return res.status(200).json({
                message: "Indent Count Fetched successfully",
                status: "success",
                count:result.length,
                result
            });
        }
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


