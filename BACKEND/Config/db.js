import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    // waitForConnections: true,
    // connectionLimit: 10,
    // queueLimit: 0
});

const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Connected to MySQL database successfully!");
        connection.release();
    } catch (err) {
        console.error("Error connecting to MySQL database:", err.message);
        process.exit(1);
    }
};

export { pool, connectDB };
