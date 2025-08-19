import mysql from "mysql2/promise";

// Création du pool MySQL
const db = await mysql.createPool({
  host: process.env.DB_HOST,       // ex: caboose.proxy.rlwy.net
  port: process.env.DB_PORT,       // ex: 46400
  user: process.env.DB_USER,       // ex: root
  password: process.env.DB_PASS,   // ton mot de passe Railway
  database: process.env.DB_NAME,   // ex: railway
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Export par défaut
export default db;
