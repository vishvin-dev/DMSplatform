import bcrypt from "bcrypt";
import { insertUser, insertUserZoneAccess, findUserByEmail, getDivisions, getSubDivisions, getSections, getGender, getMaritalStatus, getRoles, getCircle, getZone } from "../../models/userModel.js";

export const useCreations = async (req, res) => {
    try {
        const userData = req.body;
      

        // check duplicate email
        const emailExists = await findUserByEmail(userData.email);
        if (emailExists.length > 0) {
            return res.status(400).json({ data: [{ message: "Email already exists" }] });
        }

        // hash password
        userData.password = await bcrypt.hash(userData.password, 10);
        userData.isForcePasswordChange = userData.isForcePasswordChange || false;
        userData.photo = userData.photo || null;

        // 1. Insert user
        const userResult = await insertUser(userData);
        const userId = userResult.insertId;

        // 2. Insert user zone access if provided
        if (userData.zoneAccess && Array.isArray(userData.zoneAccess)) {
            for (let zone of userData.zoneAccess) {
                await insertUserZoneAccess(userId, zone, userData.roleId);
            }
        }

        return res.status(201).json({
            data: [{ message: "User created successfully", status: "success" }]
        });

    } catch (error) {
        console.error("User Creation Error:", error);
        res.status(500).json({ data: [{ message: "Internal server error" }] });
    }
};


export const getUserDropDowns = async (req, res) => {
    const { flagId, circle_code, div_code, sd_code,zone_code } = req.body;

    try {
        let results;

        if (flagId == 1) {
            results = await getDivisions(circle_code);
        } else if (flagId == 2) {
            if (!div_code) return res.status(400).json({ error: "div_code is required" });
            results = await getSubDivisions(div_code);
        } else if (flagId == 3) {
            if (!sd_code) return res.status(400).json({ error: "sd_code is required" });
            results = await getSections(sd_code);
        } else if (flagId == 4) {
            results = await getGender();
        } else if (flagId == 5) {
            results = await getMaritalStatus();
        }
          else if (flagId == 6) {
            results = await getRoles();
        }
          else if (flagId == 7) {
            results = await getCircle(zone_code);
        }
        else if (flagId == 8) {
            results = await getZone();
        } else {
            return res.status(400).json({ error: "Invalid flagId" });
        }

        return res.json({ status: "success", message: "DropDown Data is fecthed successfully", data: results });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};




