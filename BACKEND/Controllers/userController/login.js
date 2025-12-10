import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment";
import {
  findUserByEmail,
  getMenuPagesByRole,
  updateFailedLogin,
  setTempBlock,
  clearTempBlock,
  resetAttempts,
  findUserZones,
  setPermanentBlock
} from "../../models/userModel.js";

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await findUserByEmail(email);

    if (users.length === 0) {
      return res.status(404).json({ message: "Invalid email or account disabled." });
    }

    const user = users[0];

    // Permanently blocked
    if (user.IsBlocked || user.isDisabled) {
      return res.status(403).json({ message: "Your account has been permanently blocked." });
    }

    // Temporarily blocked
    if (user.IsTempBlocked && user.TempBlockedOn) {
      const blockedAt = moment(user.TempBlockedOn);
      const diffMinutes = moment().diff(blockedAt, "minutes");

      if (diffMinutes < 2) {
        return res.status(429).json({
          message: `Too many failed attempts. Please try again after ${2 - diffMinutes} minute(s).`
        });
      } else {
        //  Clear temp block but KEEP attempt count
        await clearTempBlock(user.User_Id);
      }
    }


    // Check password
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      const newAttempts = await updateFailedLogin(user.User_Id);

      if (newAttempts >= 5) {
        await setPermanentBlock(user.User_Id);
        return res.status(403).json({ message: "Your account has been permanently blocked." });
      }

      if (newAttempts === 3) {
        // 3 wrong temp block for 2 minutes
        await setTempBlock(user.User_Id);
        return res.status(429).json({ message: "Account temporarily locked. Try again in 2 minutes." });
      }

      if (newAttempts === 4) {
        // Warn user on 4th wrong
        return res.status(401).json({
          message: "Invalid password. You have only 1 attempt left before permanent block."
        });
      }

      // Default invalid password
      return res.status(401).json({ message: "Invalid password." });
    }

    //  On success, reset everything
    await resetAttempts(user.User_Id);

    const menuPages = await getMenuPagesByRole(user.Role_Id);
    const userZones = await findUserZones(user.User_Id);


    // this is the sending zonelevel ok 
    function getUserZoneLevel(zone) {
      if (zone.so_code) return "section";
      if (zone.sd_code) return "subdivision";
      if (zone.div_code) return "division";
      if (zone.circle_code) return "circle";
      if (zone.zone_code) return "zone";
      return "none";
    }

    const zonesWithLevel = userZones.map(z => ({
      ...z,
      level: getUserZoneLevel(z)
    }));

    const token = jwt.sign(
      {
        userId: user.User_Id,
        roleId: user.Role_Id,
        email: user.Email,
        loginName: user.LoginName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      status: "success",
      message: "Login successful",
      token,
      user: {
        User_Id: user.User_Id,
        middleName: user.middleName,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        Role_Id: user.Role_Id,
        LoginName: user.LoginName,
        Division_Id: user.Division_Id,
        SubDivision_Id: user.SubDivision_Id,
        Section_Id: user.Section_Id,
        DateOfBirth: user.DateofBirth,
        Photo: user.Photo,
        ProjectName: user.ProjectName,
        PhoneNumber: user.PhoneNumber,
        MaritalStatus_Id: user.MaritalStatus_Id,
        Gender_Id: user.Gender_Id,
        IsForcePasswordChange: user.IsForcePasswordChange,
        Status: user.Status,
        isDisabled: user.isDisabled,
        zones: zonesWithLevel,
        menuPage: menuPages,
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default login;
















// C:\Users\Praveen\Desktop\DMSSSSS

// mysqldump -u root -p dmstest1 > C:\Users\Praveen\Desktop\DMSSSSS\mysqldump.sql

