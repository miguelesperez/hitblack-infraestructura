const db = require('../config/db');

exports.todos = async () => (await db.query('SELECT * FROM partidos ORDER BY fecha'))[0];

exports.porId = async (id) => (await db.query('SELECT * FROM partidos WHERE id=?', [id]))[0][0];

exports.crear = async (p) => {
  const [r] = await db.query(
    'INSERT INTO partidos (equipo_local,equipo_visitante,fecha,cuota_local,cuota_empate,cuota_visitante) VALUES (?,?,?,?,?,?)',
    [p.equipo_local, p.equipo_visitante, p.fecha, p.cuota_local, p.cuota_empate, p.cuota_visitante]);
  return r.insertId;
};

exports.actualizar = async (id, p) => (await db.query(
  'UPDATE partidos SET equipo_local=?,equipo_visitante=?,fecha=?,cuota_local=?,cuota_empate=?,cuota_visitante=? WHERE id=?',
  [p.equipo_local, p.equipo_visitante, p.fecha, p.cuota_local, p.cuota_empate, p.cuota_visitante, id]))[0].affectedRows;

exports.borrar = async (id) => (await db.query('DELETE FROM partidos WHERE id=?', [id]))[0].affectedRows;

exports.finalizar = async (id, resultado) =>
  db.query("UPDATE partidos SET estado='FINALIZADO', resultado=? WHERE id=?", [resultado, id]);
