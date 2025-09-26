
import { insertIndentCreation} from "../../models/Indent.js"

export const Indent = async (req, res) => {
    const { flagId, ...data } = req.body;

    try {
        if (!flagId) {
            return res.status(400).json({ status: "failed", message: "flagId is required" });
        }
        // this is the inserting the indentt with particular DIV/SUBDIV/SECTION and generated the UniqueIndenetId and sent to the frontend and inserted automatically in the table ok 
        if (Number(flagId) === 1) {
            const result = await insertIndentCreation();
            return res.status(200).json({
                message: "Indent Data Inserted Successfully",
                status: "success",
                result
            });
        }
        else {
            return res.status(404).json({ message: "Invalid FlagID", status: "false" });
        }

    } catch (error) {
        console.error("Error in DocumentsAuditLogs:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            status: "false",
            error: error.message || error
        });
    }
};
