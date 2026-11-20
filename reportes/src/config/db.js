require('dotenv').config();
const mysql = require('mysql2/promise');

const DB = process.env.DB_NAME || 'reportes_db';
const conexion = {
  host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD
};

const pool = mysql.createPool({
  ...conexion, database: DB, waitForConnections: true, connectionLimit: 10
});

// Crea la base y la tabla si no existen (el job de Spark hace lo mismo). Reintenta mientras MySQL arranca.
async function asegurarEsquema(intentos = 90) {
  for (let i = 1; i <= intentos; i++) {
    try {
      const c = await mysql.createConnection(conexion);
      await c.query(`CREATE DATABASE IF NOT EXISTS \`${DB}\` CHARACTER SET utf8mb4`);
      await c.query(
        `CREATE TABLE IF NOT EXISTS \`${DB}\`.reportes (
           nombre VARCHAR(60) PRIMARY KEY,
           titulo VARCHAR(200) NOT NULL,
           datos JSON NOT NULL,
           generado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
      await c.end();
      console.log('[reportes] esquema listo');
      return;
    } catch (e) {
      console.log(`[reportes] MySQL no está listo (intento ${i}/${intentos}): ${e.code || e.message}`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  console.error('[reportes] no se pudo preparar el esquema');
}

pool.listo = asegurarEsquema();
module.exports = pool;
