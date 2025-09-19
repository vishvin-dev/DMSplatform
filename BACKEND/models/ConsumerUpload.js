import { pool } from "../Config/db.js";

export const insertConsumerUpload = async (dataArray) => {
    const query = `
        INSERT INTO consumer_details (
            rr_no, account_id, consumer_name, consumer_address,
            so_pincode, sd_pincode, meter_type, latitude, longitude,
            tariff, mrcode, gescom, zone, circle, division, section,
            sub_division, read_date, sp_id, feeder_name, feeder_code,
            old_meter_serial, phone, phase_type, category
        ) VALUES ?
    `;

    const [result] = await pool.query(query, [dataArray]);
    return result;
};
