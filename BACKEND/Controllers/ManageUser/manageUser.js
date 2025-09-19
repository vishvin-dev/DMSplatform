import { getAllUsersWithDetails, updateUserData, insertUserZoneAccesss, deleteUserZoneAccess, findUserById, updatePasswordOnly, getDivisions, getSubDivisions, getSections, getGender, getMaritalStatus, getRoles, updateUserActiveStatus }
    from "../../models/userModel.js";
import bcrypt from "bcrypt";

export const manageUser = async (req, res) => {
    const { flagId, User_Id, newPassword } = req.body;

    try {
        // Flag 1: View all users
        if (flagId == 1) {
            const users = await getAllUsersWithDetails();
            return res.status(200).json({
                status: "success",
                message: "User list fetched successfully",
                data: users,
            });
        }
        // Flag 2: Update user info (excluding password)
        if (flagId == 2) {
            if (!User_Id) {
                return res.status(400).json({ error: "User_Id is required" });
            }

            // Remove password if present in payload
            delete req.body.Password;

            // 1. Update user info
            const userUpdateResult = await updateUserData(req.body);

            if (userUpdateResult.affectedRows === 0) {
                return res.status(400).json({ message: "User update failed or no changes made" });
            }

            // 2. Update Zone Access
            if (req.body.zoneAccess && Array.isArray(req.body.zoneAccess)) {
                // Delete old zone access entries
                await deleteUserZoneAccess(User_Id);

                // Insert new zone access entries (without Role_Id)
                for (const access of req.body.zoneAccess) {
                    await insertUserZoneAccesss(User_Id, access.zone_code, access.circle_code, access.div_code, access.sd_code, access.so_code);
                }
            }

            return res.status(200).json({
                status: "success",
                message: "User information and zone access updated successfully",
            });
        }

        // Flag 3: User updates their password only
        if (flagId == 3) {
            if (!User_Id || !newPassword) {
                return res.status(400).json({ error: "User_Id and newPassword are required" });
            }
            const user = await findUserById(User_Id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Use new function to update password only
            const updateResult = await updatePasswordOnly(User_Id, hashedPassword);

            if (updateResult.affectedRows === 0) {
                return res.status(400).json({ message: "Password update failed" });
            }
            return res.status(200).json({
                status: "success",
                message: "Password updated successfully",
            });
        }
        // Inside manageUser controller
        if (flagId == 4) {
            const { User_Id, isDisabled, requestUserName } = req.body;

            if (User_Id === undefined || isDisabled === undefined || !requestUserName) {
                return res.status(400).json({ error: "User_Id, isDisabled, and requestUserName are required" });
            }

            const updateResult = await updateUserActiveStatus(User_Id, isDisabled, requestUserName);

            if (updateResult.affectedRows === 0) {
                return res.status(400).json({ message: "Status update failed or no changes made" });
            }

            return res.status(200).json({
                status: "success",
                message: `User has been ${isDisabled ? "disabled" : "activated"} successfully`,
            });
        }


        return res.status(400).json({ error: "Invalid flagId" });
    } catch (error) {
        console.error("Error in manageUser:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const getManageDropdowns = async (req, res) => {
    const { flagId, div_code, sd_code } = req.body;

    try {
        let results;

        if (flagId == 1) {
            results = await getDivisions();
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
        } else {
            return res.status(400).json({ error: "Invalid flagId" });
        }

        return res.json({ status: "success", message: "DropDown Data is fecthed successfully", data: results });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
