import { findUserByEmail,updateUserPassword } from "../../models/userModel.js";
import bcrypt from "bcrypt"


// THIS IS THE RESET PASSWORD
export const resetPassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ message: "All fields are required.", status: "failed" });
        }
         // 2️ Basic email format validation (no external library)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format.",
                status: "failed",
            });
        }

        const users = await findUserByEmail(email);
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "User not found or disabled.", status: "failed" });
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(currentPassword, user.Password);

        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect.", status: "failed" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await updateUserPassword(email, hashedPassword);

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Password update failed.", status: "failed" });
        }
        return res.status(200).json({ message: "Password reset successfully.", status: "success" });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        return res.status(500).json({ message: "Internal Server Error", status: "failed" });
    }
};
