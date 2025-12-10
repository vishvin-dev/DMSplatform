// THIS IS THE COMPLETE MYSQL CONNECTION OK 

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



// import pkg from "pg";
// import dotenv from "dotenv";

// dotenv.config();

// const { Pool } = pkg;

// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT || 5432,
// });

// const connectDB = async () => {
//     try {
//         const client = await pool.connect();
//         console.log("Connected to PostgreSQL database successfully!");
//         client.release();
//     } catch (err) {
//         console.error("Error connecting to PostgreSQL database:", err.message);
//         process.exit(1);
//     }
// };

// export { pool, connectDB };
