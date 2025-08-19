
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function testDB() {
  try {
    const pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const [rows] = await pool.query("SELECT NOW() AS currentTime");
    console.log("✅ Database connection successful!");
    console.log("Current time from DB:", rows[0].currentTime);

    await pool.end();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}

testDB();
