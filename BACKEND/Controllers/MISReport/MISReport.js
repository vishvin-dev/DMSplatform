import {
    getZonee,
    getCirclee,
    getDivisionss,
    getSubDivisionss,
    getSectionss, getRoless,
    getUsersByRoleAndLocation,
    getReportData
} from "../../models/MisReport.js"
import { getDateRange } from "../../utils/DateMethods/dateMethods.js"

export const MISReportDropdown = async (req, res) => {
    const { flagId, zone_code, circle_code, div_code, sd_code, exclude_sections } = req.body;
    try {
        let results;
        //==================================== THIS IS ALL FECTHING THE DROPDOWNS FOR THE REPORT OK  ===========================================================
        if (flagId === 1) {
            results = await getZonee();
        } else if (flagId === 2) {
            results = await getCirclee(zone_code);
        } else if (flagId === 3) {
            results = await getDivisionss(circle_code);
        } else if (flagId === 4) {
            if (!div_code) return res.status(400).json({ error: "div_code is required" });
            results = await getSubDivisionss(div_code);
        } else if (flagId === 5) {
            if (!sd_code) return res.status(400).json({ error: "sd_code is required" });
            const exclude = exclude_sections ?? [];
            results = await getSectionss(sd_code, exclude);
        } else if (flagId === 6) {
            results = await getRoless();
        } else {
            return res.status(400).json({ error: "Invalid flagId" });
        }
        return res.status(200).json({ status: true, data: results });
    } catch (error) {
        console.log("Internal Server Error")
        return res.status(500).json({ status: false, message: "Internal Server Error", error: error.message })
    }
}
//=====================================================================================================================

//====================================================== THIS IS THE FETCHING THE USER DROPDOWN BASED ON THE ROLEID OF THAT SECTIONS  ===============================================================
export const getUsersDropdown = async (req, res) => {
    try {
        const { role_id, zone_code, circle_code, div_code, sd_code, so_code } = req.body;
        if (!role_id) return res.status(400).json({ error: "role_id is required" });

        const filters = { zone_code, circle_code, div_code, sd_code, so_code };
        const users = await getUsersByRoleAndLocation(role_id, filters);

        return res.status(200).json({ status: true, data: users });
    } catch (error) {
        console.error("getUsersDropdown Error:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
};

export const generateReport = async (req, res) => {
    try {
        const { filters = {}, dateMethod = "day", datePayload = {} } = req.body;
        console.log(req.body)

        let dateRange;
        try {
            dateRange = getDateRange(dateMethod, datePayload);
        } catch (err) {
            return res.status(400).json({
                status: false,
                message: err.message
            });
        }

        const rows = await getReportData(filters, dateRange);

        return res.status(200).json({
            status: true,
            meta: { filters, dateRange },
            data: rows
        });

    } catch (error) {
        console.error("generateReport Error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
