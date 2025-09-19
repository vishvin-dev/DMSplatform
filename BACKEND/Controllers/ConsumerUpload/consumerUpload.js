import csv from "csv-parser";
import fs from "fs";
import { insertConsumerUpload } from "../../models/ConsumerUpload.js";

export const consumerUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const filePath = req.file.path;
        const results = [];

        const formatDate = (input) => {
            if (!input || typeof input !== "string") return null;

            const parts = input.split("-");
            if (parts.length !== 3) return null;

            const [day, month, year] = parts;
            if (!day || !month || !year) return null;

            return `${year}-${month}-${day}`;
        };

        fs.createReadStream(filePath)
            .pipe(csv())  
            .on("data", (data) => {
                const rawDate = data.read_date?.trim() || "";
                const formattedDate = formatDate(rawDate);

                results.push([
                    data.rr_no?.trim() || null,
                    data.account_id?.trim() || null,
                    data.consumer_name?.trim() || null,
                    data.consumer_address?.trim() || null,
                    data.so_pincode?.trim() || null,
                    data.sd_pincode?.trim() || null,
                    data.meter_type?.trim() || null,
                    data.latitude?.trim() || null,
                    data.longitude?.trim() || null,
                    data.tariff?.trim() || null,
                    data.mrcode?.trim() || null,
                    data.gescom?.trim() || null,
                    data.zone?.trim() || null,
                    data.circle?.trim() || null,
                    data.division?.trim() || null,
                    data.section?.trim() || null,
                    data.sub_division?.trim() || null,
                    formattedDate,
                    data.sp_id?.trim() || null,
                    data.feeder_name?.trim() || null,
                    data.feeder_code?.trim() || null,
                    data.old_meter_serial?.trim() || null,
                    data.phone?.trim() || null,
                    data.phase_type?.trim() || null,
                    data.category?.trim() || null,
                ]);
            })
            .on("end", async () => { 
                try {
                    const dbResult = await insertConsumerUpload(results);
                    fs.unlinkSync(filePath);

                    return res.status(200).json({
                        status: "success",
                        message: "Consumer data inserted successfully",
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

export const singleConsumerUpload=async(req,res)=>{
    const {values}=req.body
    try {
        let results
        results=await insertConsumerUpload(values)
        return res.status(201).json({success:true, message:"Consumer Data is Inserted successfully"})
    } catch (error) {
        console.log(error)
         return res.status(500).json({success:false, message:"Internal Server Error"})
    }
}
