import { pool } from "../Config/db.js"


export const getDocumentCategoryDetails = async () => {
    const [result] = await pool.execute(
        `SELECT * FROM DocumentCategoryMaster`
    );
    return result;
};

export const addDocumentCategoryDetails = async (CategoryName, Description, IsActive, requestUserName) => {
    const [result] = await pool.execute(
        `INSERT INTO DocumentCategoryMaster (CategoryName, Description, IsActive, requestUserName) VALUES (?, ?, ?, ?)`,
        [CategoryName, Description, IsActive, requestUserName]
    );
    return { insertId: result.insertId };
};

export const editDocumentCategoryDetails = async (Category_Id, CategoryName, Description, IsActive, requestUserName) => {
    const [result] = await pool.execute(
        `UPDATE DocumentCategoryMaster 
         SET CategoryName = ?, Description = ?, IsActive = ?, UpdatedOn = CURRENT_TIMESTAMP, requestUserName = ?
         WHERE Category_Id = ?`,
        [CategoryName, Description, IsActive, requestUserName, Category_Id]
    );
    return { affectedRows: result.affectedRows };
};