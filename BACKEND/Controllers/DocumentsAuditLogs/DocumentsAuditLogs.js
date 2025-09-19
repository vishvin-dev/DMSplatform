import { getDcoumentsAuditlogs1, getDocumentsAuditlogsByAccount  } from "../../models/DocumentsAuditLogs.js"

//  Controller to fetch document audit logs with filters
export const DocumentsAuditLogs = async (req, res) => {
    const { flagId, searchValue, Role_Id, filterType, filterValue, account_Id } = req.body;

    try {
        if (!flagId) {
            return res.status(400).json({ status: "failed", message: "flagId is required" });
        }

        if (Number(flagId) === 1) {
            // Call your main function with filters
            const result = await getDcoumentsAuditlogs1(
                searchValue || "",
                Role_Id || null,
                filterType || null,
                filterValue || null
            );

            return res.status(200).json({
                message: "Documents AuditLogs Data Fetched Successfully",
                status: "success",
                count: result.length,
                result
            });
        }
        else if (Number(flagId) === 2) {
            const result = await getDocumentsAuditlogsByAccount (account_Id);
            return res.status(200).json({
                message: "Documents AuditLogs Data Fetched Successfully",
                status: "success",
                count: result.length,
                result
            });
        } else {
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
