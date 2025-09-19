import {
    getAllLoginAuditDetails,
    postLoginAudits,
    updateLogoutTime
} from "../../models/userModel.js";

export const LoginAudit = async (req, res) => {
    try {
        const { flagId, ...auditData } = req.body;

        if (!flagId) {
            return res.status(400).json({ status: "failed", message: "flagId is required" });
        }

        // Fetch all audit logs
        if (flagId === 1) {
            const result = await getAllLoginAuditDetails();
            return res.status(200).json({
                status: "success",
                message: "Login Audit Data Fetched Successfully",
                result
            });
        }

        else if (flagId === 2) {
            const auditData = req.body;

            if (!auditData.UserID) {
                return res.status(400).json({ status: "failed", message: "UserID is required" });
            }

            const insertedId = await postLoginAudits(auditData);

            return res.status(201).json({
                status: "success",
                message: "Login Audit Data Added Successfully",
                loginDetailId: insertedId
            });
        }
        // Update logout time
        else if (flagId === 3) {
            if (!auditData.UserLoginDetailID) {
                return res.status(400).json({ status: "failed", message: "UserLoginDetailID is required" });
            }
            await updateLogoutTime(auditData.UserLoginDetailID);
            return res.status(200).json({
                status: "success",
                message: "Logout Time Updated Successfully"
            });
        }


        else {
            return res.status(400).json({ status: "failed", message: "Invalid flagId provided" });
        }

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Error processing login audit data",
            error: error.message
        });
    }
};
