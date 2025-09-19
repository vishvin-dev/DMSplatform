import { pool } from "../Config/db.js";

//===================USER_CREATION=================
//this is the userCreation things ======================================//
export const findUserByEmail = async (email) => {
    const [result] = await pool.execute(
        `SELECT * FROM User WHERE Email = ? AND isDisabled = 0`,
        [email]
    );
    return result;
};
// this is the fetching the zoneaccess of teh user when he logins ok 
export const findUserZones = async (userId) => {
    const [result] = await pool.execute(
                    `SELECT
                uza.UserZoneAccess_Id,
                uza.zone_code,
                (SELECT zone FROM zone_codes WHERE zone_code = uza.zone_code LIMIT 1) AS zone_name,
                uza.circle_code,
                (SELECT circle FROM zone_codes WHERE circle_code = uza.circle_code LIMIT 1) AS circle,
                uza.div_code,
                (SELECT division FROM zone_codes WHERE div_code = uza.div_code LIMIT 1) AS division,
                uza.sd_code,
                (SELECT sub_division FROM zone_codes WHERE sd_code = uza.sd_code LIMIT 1) AS sub_division,
                uza.so_code,
                (SELECT section_office FROM zone_codes WHERE so_code = uza.so_code LIMIT 1) AS section_office
            FROM UserZoneAccess uza
            WHERE uza.User_Id = ?;
            `,
        [userId]
    );
    return result;
};
//this is the sending information to the frontend when he login ok 
export const findUserByEmailWithZones = async (email) => {
    const [rows] = await pool.execute(
        `
     SELECT 
      u.User_Id,
      u.FirstName,
      u.middleName,
      u.LastName,
      u.ProjectName,
      u.DateofBirth,
      u.PhoneNumber,
      u.MaritalStatus_Id,
      u.Gender_Id,
      u.Email,
      u.Password,
      u.IsForcePasswordChange,
      u.Role_Id,
      u.LoginName,
      u.Photo,
      u.isDisabled,
      r.RoleName,     
      uza.UserZoneAccess_Id,               
      uza.div_code,
      uza.sd_code,
      z.division,
      z.sub_division,
      z.section_office,
      COALESCE(uza.so_code, z.so_code) AS so_code
    FROM user u
    LEFT JOIN userzoneaccess uza ON u.User_Id = uza.User_Id
    LEFT JOIN roles r ON u.Role_Id = r.Role_Id
    LEFT JOIN zone_codes z 
           ON uza.div_code = z.div_code
          AND uza.sd_code = z.sd_code
          AND (uza.so_code = z.so_code OR uza.so_code IS NULL)
    WHERE u.Email = ? AND u.isDisabled = 0
    `,
        [email]
    );

    return rows;
};
// Increment failed attempts and return updated count
export const updateFailedLogin = async (userId) => {
    await pool.execute(
        `UPDATE User SET AttemptCount = AttemptCount + 1 WHERE User_Id = ?`,
        [userId]
    );
    const [[user]] = await pool.execute(
        `SELECT AttemptCount FROM User WHERE User_Id = ?`,
        [userId]
    );
    return user.AttemptCount;
};
// Temporary block (3 failed attempts)
export const setTempBlock = async (userId) => {
    await pool.execute(
        `UPDATE User SET IsTempBlocked = 1, TempBlockedOn = NOW() WHERE User_Id = ?`,
        [userId]
    );
};
// Clear only temp block flags, keep AttemptCount
export const clearTempBlock = async (userId) => {
    await pool.execute(
        `UPDATE User SET IsTempBlocked = 0, TempBlockedOn = NULL WHERE User_Id = ?`,
        [userId]
    );
};
// Reset all attempts (only on successful login)
export const resetAttempts = async (userId) => {
    await pool.execute(
        `UPDATE User 
     SET AttemptCount = 0, IsTempBlocked = 0, TempBlockedOn = NULL 
     WHERE User_Id = ?`,
        [userId]
    );
};
// Permanent block (after 5 failed attempts)
export const setPermanentBlock = async (userId) => {
    await pool.execute(
        `UPDATE User 
     SET IsBlocked = 1, isDisabled = 1, BlockedOn = NOW()
     WHERE User_Id = ?`,
        [userId]
    );
};
export const findUserById = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT * FROM \`user\` WHERE User_Id = ? AND isDisabled = 0`,
        [userId]
    );
    return rows[0]; // return only single user
};
// export const updateUserPassword = async (email, hashedPassword) => {
//     const [result] = await pool.execute(
//         `UPDATE \`user\` SET \`Password\` = ?, \`IsForcePasswordChange\` = 0, \`UpdatedOn\` = CURRENT_TIMESTAMP WHERE \`Email\` = ?`,
//         [hashedPassword, email]
//     );
//     return result;
// };

export const updateUserPassword = async (email, hashedPassword) => {
    const [result] = await pool.execute(
        `UPDATE \`user\` 
         SET \`Password\` = ?, 
             \`IsForcePasswordChange\` = 0, 
             \`PasswordChangedOn\` = CURRENT_TIMESTAMP
         WHERE \`Email\` = ?`,
        [hashedPassword, email]
    );
    return result;
};
//this is for the userCreation things ok 
export const insertUser = async (userData) => {
    const query = `
        INSERT INTO \`User\` 
        (FirstName, middleName, LastName, ProjectName, DateofBirth, PhoneNumber, 
         MaritalStatus_Id, Gender_Id, Email, Password, IsForcePasswordChange, 
         Role_Id, LoginName, Photo, isDisabled, CreatedOn, UpdatedOn)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await pool.execute(query, [
        userData.firstName,
        userData.middleName,
        userData.lastName,
        userData.projectName,
        userData.dateOfBirth,
        userData.phoneNumber,
        userData.maritalStatusId,
        userData.genderId,
        userData.email,
        userData.password,
        userData.isForcePasswordChange,
        userData.roleId,
        userData.loginName,
        userData.photo,
        userData.isDisabled || 0
    ]);

    return result;
};
export const insertUserZoneAccess = async (userId, zone, roleId) => {
    const query = `
        INSERT INTO userzoneaccess 
        (User_Id, zone_code, circle_code, div_code, sd_code, so_code, Role_Id, CreatedOn, UpdatedOn)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await pool.execute(query, [
        userId,
        zone.zone_code,
        zone.circle_code || null,   // new field
        zone.div_code || null,
        zone.sd_code || null,
        zone.so_code || null,
        roleId || null
    ]);

    return result;
};
//====================================================================//




//==============SIDEBAR MENU================================
//===============================//
// this is the managing the sidebar from backend side ok to frontend
function buildNestedMenu(rows) {
    const pageMap = {};
    const result = [];

    // Step 1: Map all pages
    rows.forEach(row => {
        pageMap[row.Page_Id] = {
            id: row.Page_Id,
            label: row.Label,
            link: row.Link,
            icon: row.Icon,
            click: row.ClickAction,
            stateVariables: row.StateVariable,
            isHeader: row.IsHeader === 1,
            isChildItem: row.IsChildItem === 1,
            parentId: row.ParentPage_Id,
            canView: true,
            subItems: []
        };
    });

    // Step 2: Build hierarchy
    Object.values(pageMap).forEach(page => {
        if (page.parentId && pageMap[page.parentId]) {
            pageMap[page.parentId].subItems.push(page);
        } else {
            result.push(page);
        }
    });

    // Step 3: Recursively rename subItems -> childItems only for second level
    function renameSubItemsToChildItems(items, level = 0) {
        items.forEach(item => {
            if (item.subItems?.length) {
                if (level >= 1) {
                    item.childItems = item.subItems;
                    delete item.subItems;
                } else {
                    renameSubItemsToChildItems(item.subItems, level + 1);
                }
            }
        });
    }

    renameSubItemsToChildItems(result);

    // Add "Menu" header
    // const alreadyHasMenuHeader = result.some(item => item.isHeader && item.label === "Menu");
    // if (!alreadyHasMenuHeader) {
    //     result.unshift({ label: "Menu", isHeader: true });
    // }

    return result;
}
export const getMenuPagesByRole = async (roleId) => {
    const [rows] = await pool.execute(`
    SELECT 
      mp.Page_Id, mp.Label, mp.Link, mp.Icon, mp.ClickAction,
      mp.ParentPage_Id, mp.IsHeader, mp.IsChildItem, mp.StateVariable
    FROM menupage mp
    JOIN rolepageaccess rpa ON mp.Page_Id = rpa.Page_Id
    WHERE rpa.Role_Id = ? AND rpa.CanView = 1 AND mp.IsActive = 1
    ORDER BY mp.ParentPage_Id, mp.Page_Id
  `, [roleId]);

    return buildNestedMenu(rows);
};
// ===============================






//===================DROPDOWN FETCHING================================
// this is all fecthing things of DIV, SUB_DIV, SECTION, GENDER, MARTITALSTATUS, ROLES,DOCUMENTLIST
//Divison

export const getCircle = async () => {
    const [result] = await pool.execute(
        `SELECT DISTINCT circle, circle_code FROM zone_codes ORDER BY circle;`
    );
    return result;
}
export const getDivisions = async (circle_code) => {
    const [result] = await pool.execute(
        `SELECT DISTINCT division, div_code FROM zone_codes WHERE circle_code = ? ORDER BY division;`,
        [circle_code]
    );
    return result;
};
// Fetch Sub-Divisions by Division Code
export const getSubDivisions = async (div_code) => {
    const [result] = await pool.execute(
        `SELECT DISTINCT sub_division, sd_code FROM zone_codes WHERE div_code = ? ORDER BY sub_division;`,
        [div_code]
    );
    return result;
};
// Fetch Sections by Sub-Division Code
export const getSections = async (sd_code) => {
    const [result] = await pool.execute(
        `SELECT DISTINCT section_office, so_code FROM zone_codes WHERE sd_code = ? ORDER BY section_office;`,
        [sd_code]
    );
    return result;
};
export const getGender = async () => {
    const [result] = await pool.execute(
        `SELECT genderId, genderName FROM Gender`
    );
    return result;
};
export const getMaritalStatus = async () => {
    const [result] = await pool.execute(
        `SELECT maritalStatusName, maritalStatusCode FROM Maritalstatus`
    );
    return result;
}
export const getRoles = async () => {
    const [result] = await pool.execute(
        `SELECT Role_Id, RoleName FROM Roles`
    );
    return result;
}
export const getDocumentLists = async () => {
    const [result] = await pool.execute(
        `SELECT DocumentList_Id, DocumentListName FROM documentslist`
    );
    return result;
}
//==================================================//






//======================= MANAGE USER===========================//
//this is Manager user fecthing details
export const getAllUsersWithDetails = async () => {
    const [rows] = await pool.execute(`
               SELECT 
                    u.User_Id,
                    u.FirstName,
                    u.middleName,
                    u.LastName,
                    u.ProjectName,
                    u.DateofBirth,
                    u.PhoneNumber,
                    u.Email,
                    u.LoginName,
                    u.IsForcePasswordChange,
                    u.Role_Id,
                    r.RoleName,
                    u.Gender_Id,
                    g.genderName,
                    u.MaritalStatus_Id,
                    m.maritalStatusCode,
                    u.isDisabled,
                    u.CreatedOn,
                    u.UpdatedOn,
                    u.UpdatedBy,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'UserZoneAccess_Id', uza.UserZoneAccess_Id,
                            'zone_code', z.zone_code,
                            'zone', z.zone,
                            'circle_code', z.circle_code,
                            'circle', z.circle,
                            'div_code', z.div_code,
                            'division', z.division,
                            'sd_code', z.sd_code,
                            'sub_division', z.sub_division,
                            'so_code', z.so_code,
                            'section_office', z.section_office
                        )
                    ) AS zoneAccess
                FROM user u
                LEFT JOIN roles r ON u.Role_Id = r.Role_Id
                LEFT JOIN gender g ON u.Gender_Id = g.genderId
                LEFT JOIN maritalstatus m ON u.MaritalStatus_Id = m.maritalStatusName
                LEFT JOIN userzoneaccess uza ON u.User_Id = uza.User_Id
                LEFT JOIN zone_codes z 
                    ON (
                        -- If section assigned fetch that section
                        (uza.so_code IS NOT NULL AND z.so_code = uza.so_code)

                        -- If only subdivision assigned fetch all sections under that subdivision
                        OR (uza.so_code IS NULL AND uza.sd_code IS NOT NULL AND z.sd_code = uza.sd_code)

                        -- If only division assigned fetch all subdivisions/sections under that division
                        OR (uza.sd_code IS NULL AND uza.div_code IS NOT NULL AND z.div_code = uza.div_code)

                        -- If only circle assigned fetch everything under that circle
                        OR (uza.div_code IS NULL AND uza.circle_code IS NOT NULL AND z.circle_code = uza.circle_code)

                        -- If only zone assigned fetch everything under that zone
                        OR (uza.circle_code IS NULL AND uza.zone_code IS NOT NULL AND z.zone_code = uza.zone_code)
                    )
                GROUP BY u.User_Id;

    `);
    return rows;
};
//this is the updating the userdata of manage screen ok 
export const updateUserData = async (userData) => {
    const {
        User_Id,
        FirstName,
        middleName,
        LastName,
        ProjectName,
        DateofBirth,
        PhoneNumber,
        MaritalStatus_Id,
        Gender_Id,
        Email,
        Role_Id,
        LoginName,
        UpdatedBy
    } = userData;

    const [result] = await pool.execute(
        `UPDATE user
         SET FirstName = ?, middleName = ?, LastName = ?, ProjectName = ?, DateofBirth = ?,
             PhoneNumber = ?, MaritalStatus_Id = ?, Gender_Id = ?, Email = ?, Role_Id = ?, 
             LoginName = ?, UpdatedBy = ?
         WHERE User_Id = ?`,
        [FirstName, middleName, LastName, ProjectName, DateofBirth,
            PhoneNumber, MaritalStatus_Id, Gender_Id, Email, Role_Id,
            LoginName, UpdatedBy || "system", User_Id]
    );
    return result;
};
//this is the manageUser updates query ok 
export const insertUserZoneAccesss = async (User_Id, zone_code, circle_code, div_code, sd_code, so_code) => {
    const [result] = await pool.execute(
        `INSERT INTO userzoneaccess (User_Id, zone_code, circle_code, div_code, sd_code, so_code)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [User_Id, zone_code, circle_code, div_code, sd_code, so_code]
    );
    return result;
};
// Delete old zone access
export const deleteUserZoneAccess = async (User_Id) => {
    const [result] = await pool.execute(
        `DELETE FROM userzoneaccess WHERE User_Id = ?`,
        [User_Id]
    );
    return result;
};
export const updatePasswordOnly = async (User_Id, hashedPassword) => {
    const [result] = await pool.execute(`
        UPDATE \`user\`
        SET Password = ?, IsForcePasswordChange = 1, UpdatedOn = CURRENT_TIMESTAMP
        WHERE User_Id = ?
    `, [hashedPassword, User_Id]);

    return result;
};
export const updateUserActiveStatus = async (User_Id, isDisabled, updatedBy) => {
    const [result] = await pool.execute(`
        UPDATE \`user\`
        SET 
            isDisabled = ?, 
            UpdatedBy = ?, 
            UpdatedOn = CURRENT_TIMESTAMP
        WHERE User_Id = ?
    `, [isDisabled ? 1 : 0, updatedBy, User_Id]);

    return result;
};

//=====================================================//






//===============LOGIN AUDITS==================
// this is the LOGN AUDITS of the users 
export const getAllLoginAuditDetails = async () => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                UserLoginDetailID,
                UserID,
                DeviceDateTime,
                HostName,
                Device,
                OSName,
                MacAddress,
                IPAddress,
                BrowserName,
                BrowserVersion,
                Latitude,
                Longitude,
                IsDisabled,
                RequestUserName,
                CreatedOn,
                UpdatedOn
            FROM userlogindetail
            ORDER BY DeviceDateTime DESC
        `);
        return rows;
    } catch (error) {
        console.error("Error fetching user login detail data:", error);
        throw error;
    }
};
export const postLoginAudits = async (auditData) => {
    const query = `
        INSERT INTO userlogindetail (
            UserID, DeviceDateTime, HostName, Device, OSName,
            MacAddress, IPAddress, BrowserName, BrowserVersion,
            Latitude, Longitude, IsDisabled, RequestUserName
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        auditData.UserID,
        auditData.DeviceDateTime
            ? new Date(auditData.DeviceDateTime)
            : new Date(), // current datetime if not provided
        auditData.HostName || null,
        auditData.Device || null,
        auditData.OSName || null,
        auditData.MacAddress?.trim() || null,
        auditData.IPAddress || null,
        auditData.BrowserName || null,
        auditData.BrowserVersion || null,
        auditData.Latitude ?? null,
        auditData.Longitude ?? null,
        auditData.IsDisabled ?? 0,
        auditData.RequestUserName || null
    ];

    const [result] = await pool.execute(query, values);
    return result.insertId;
};
export const updateLogoutTime = async (loginDetailId) => {
    const query = `
        UPDATE userlogindetail
        SET LogoutDateTime = ?
        WHERE UserLoginDetailID = ?
    `;
    const [result] = await pool.execute(query, [new Date(), loginDetailId]);
    return result;
};








