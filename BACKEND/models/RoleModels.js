import { pool } from "../Config/db.js";

export const getAllRoles = async () => {
    const [rows] = await pool.execute(`SELECT * FROM Roles`)
    return rows
}

export const addRole = async (userRole) => {

    const query = `INSERT INTO Roles(RoleName,Role_Code, Status,Description, RequestUserName) VALUES (?,?,?,?,?)`
    const values = [
        userRole.RoleName,
        userRole.Role_Code,
        userRole.Status,
        userRole.Description,
        userRole.RequestUserName
    ]
    const [rows] = await pool.execute(query, values)
    return rows
}

export const updateRoles = async (userRole) => {
    const query = `
        UPDATE Roles SET 
            RoleName = ?,
            Status = ?,
            Description = ?,
            RequestUserName = ?,
            Role_Code = ?,
            UpdatedOn = CURRENT_TIMESTAMP
        WHERE Role_Id = ?
    `;
    
    const values = [
        userRole.RoleName,
        userRole.Status,
        userRole.Description,
        userRole.RequestUserName,
        userRole.Role_Code,
        userRole.Role_Id  
    ];

    const [rows] = await pool.execute(query, values);
    return rows;
};

