import { pool } from "../Config/db.js";

export const insertZoneUploadData = async (dataArray) => {
    const query = `
        INSERT INTO zone_codes 
        (package, zone, zone_code, circle, circle_code, 
         division, div_code, sub_division, sd_code, 
         section_office, so_code)
        VALUES ?
        ON DUPLICATE KEY UPDATE
            package = VALUES(package),
            zone = VALUES(zone),
            zone_code = VALUES(zone_code),
            circle = VALUES(circle),
            circle_code = VALUES(circle_code),
            division = VALUES(division),
            div_code = VALUES(div_code),
            sub_division = VALUES(sub_division),
            sd_code = VALUES(sd_code),
            section_office = VALUES(section_office),
            so_code = VALUES(so_code)
    `;

    const [result] = await pool.query(query, [dataArray]);
    return result;
};
