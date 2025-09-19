import { getAllRoles, addRole, updateRoles } from "../../models/RoleModels.js"

export const getRole = async (req, res) => {
    //  console.log("User from token:", req.user);
    try {
        const rows = await getAllRoles()
        return res.status(200).json({ data: rows });
    } catch (error) {
        console.error("Error fetching roles:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const addRoles = async (req, res) => {
    try {
        const userRole = req.body;
        const rows = await addRole(userRole);
        return res.status(201).json({ status: "success", message: "Roles added successfully" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "RoleName must be unique" });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateRole = async (req, res) => {
    try {
        const userData = req.body;
        const rows = await updateRoles(userData);
        return res.status(201).json({
            message: "Roles updated successfully",
            status: "success"
        });
    } catch (error) {
        console.error("Error updating role:", error);
        return res.status(500).json({
            message: "Failed to update roles",
            status: "error",
            error: error.message
        });
    }
};





