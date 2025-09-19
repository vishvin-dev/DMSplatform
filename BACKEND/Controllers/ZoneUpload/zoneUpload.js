import csv from "csv-parser";
import fs from "fs";
import { insertZoneUploadData } from "../../models/zoneUploadModel.js";

export const zoneUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const filePath = req.file.path;
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (data) => {
                // Trim each field to remove extra spaces
                results.push([
                    data.package?.trim() || null,
                    data.zone?.trim() || null,
                    data.zone_code?.trim() || null,
                    data.circle?.trim() || null,
                    data.circle_code?.trim() || null,
                    data.division?.trim() || null,
                    data.div_code?.trim() || null,
                    data.sub_division?.trim() || null,
                    data.sd_code?.trim() || null,
                    data.section_office?.trim() || null,
                    data.so_code?.trim() || null,
                ]);
            })
            .on("end", async () => {
                try {
                    const dbResult = await insertZoneUploadData(results);
                    fs.unlinkSync(filePath); // delete uploaded file after processing

                    return res.status(200).json({
                        status: "success",
                        message: "Zone data inserted successfully",
                        insertedRows: results.length,
                        affectedRows: dbResult.affectedRows,
                    });
                } catch (dbErr) {
                    console.error("Database error:", dbErr);
                    return res.status(500).json({
                        message: "Database insert failed",
                        error: dbErr.message,
                    });
                }
            });
    } catch (error) {
        console.error("CSV processing error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


export const singleZoneUpload = async (req, res) => {
    const {values} = req.body
    try {
        let results
        results = await insertZoneUploadData(values)
        return res.status(201).json({ success: true, message: "The zone upload data uploaded successfully" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server" })
    }
}
