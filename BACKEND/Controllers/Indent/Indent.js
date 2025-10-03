import { insertIndentCreation, submitIndent, updateIndentWithFile } from "../../models/Indent.js";

export const Indent = async (req, res) => {
    const { flagId, ...data } = req.body;

    try {
        if (!flagId) {
            return res.status(400).json({
                status: "failed",
                message: "flagId is required"
            });
        }

        // 1️ Create new Indent (with auto-generated Indent_No)
        if (Number(flagId) === 1) {
            const result = await insertIndentCreation(data);
            return res.status(200).json({
                message: "Indent created successfully",
                status: "success",
                result
            });
        }
        else if (Number(flagId) === 2) {
            const result = await submitIndent(data);
            return res.status(200).json({
                message: "Indent submitted successfully",
                status: "success",
                result
            });
        }
        // Step 2️ Update indent with file + status
        // In your Indent controller
        else if (Number(flagId) === 3) {
            // Multer stores uploaded file info in req.file
            const filePath = req.file ? req.file.path : null;

            const result = await updateIndentWithFile({
                ...data,        // Indent_Id, Status_Id, UploadedByUser_Id
                FilePath: filePath
            });

            return res.status(200).json({
                message: "Indent updated with file successfully",
                status: "success",
                result
            });
        }


        // 2️ Fetch Indent Views (for dashboard / listing)
        else if (Number(flagId) === 4) {
            const result = await fetchCreatedIndenetViews(data);
            return res.status(200).json({
                message: "Indent views fetched successfully",
                status: "success",
                result
            });
        }
        //Invalid flag
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



