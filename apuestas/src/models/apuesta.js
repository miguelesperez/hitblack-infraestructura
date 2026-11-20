const db = require('../config/db');

exports.todas = async () => (await db.query('SELECT * FROM apuestas ORDER BY fecha DESC'))[0];

exports.porUsuario = async (uid) =>
  (await db.query('SELECT * FROM apuestas WHERE usuario_id=? ORDER BY fecha DESC', [uid]))[0];

exports.pendientesPorPartido = async (pid) =>
  (await db.query("SELECT * FROM apuestas WHERE partido_id=? AND estado='PENDIENTE'", [pid]))[0];

exports.crear = async (a) => (await db.query(
  'INSERT INTO apuestas (usuario_id,usuario,email,partido_id,tipo,monto,cuota,ganancia_potencial) VALUES (?,?,?,?,?,?,?,?)',
  [a.usuario_id, a.usuario, a.email, a.partido_id, a.tipo, a.monto, a.cuota, a.ganancia_potencial]))[0].insertId;

exports.marcar = async (id, estado) => db.query('UPDATE apuestas SET estado=? WHERE id=?', [estado, id]);