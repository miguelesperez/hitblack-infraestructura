const db = require('../config/db');

const CAMPOS = 'id,nombre,email,usuario,saldo'; // nunca devolvemos el password

exports.todos = async () => (await db.query(`SELECT ${CAMPOS} FROM usuarios`))[0];

exports.porId = async (id) => (await db.query(`SELECT ${CAMPOS} FROM usuarios WHERE id=?`, [id]))[0][0];

exports.porUsuario = async (u) => (await db.query('SELECT * FROM usuarios WHERE usuario=?', [u]))[0][0];

exports.crear = async (u) => (await db.query(
  'INSERT INTO usuarios (nombre,email,usuario,password) VALUES (?,?,?,?)',
  [u.nombre, u.email, u.usuario, u.password]))[0].insertId;

exports.actualizar = async (id, u) => (await db.query(
  'UPDATE usuarios SET nombre=?, email=? WHERE id=?', [u.nombre, u.email, id]))[0].affectedRows;

exports.borrar = async (id) => (await db.query('DELETE FROM usuarios WHERE id=?', [id]))[0].affectedRows;

// monto positivo suma, negativo resta. No deja el saldo por debajo de 0.
exports.ajustarSaldo = async (id, monto) => (await db.query(
  'UPDATE usuarios SET saldo = saldo + ? WHERE id=? AND saldo + ? >= 0', [monto, id, monto]))[0].affectedRows;
  