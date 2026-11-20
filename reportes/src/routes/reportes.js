const router = require('express').Router();
const db = require('../config/db');
const w = (fn) => (req, res) => fn(req, res).catch(e => res.status(500).json({ error: e.message }));

const objeto = (v) => (typeof v === 'string' ? JSON.parse(v) : v); // MySQL entrega JSON ya parseado; MariaDB como texto

// Estado del servicio (usado por las pruebas de balanceo de carga: responde el nombre del contenedor)
router.get('/salud', (req, res) => res.json({ estado: 'ok', instancia: require('os').hostname() }));

// Lista de reportes disponibles
router.get('/', w(async (req, res) => {
  await db.listo;
  const [rows] = await db.query('SELECT nombre, titulo, generado_en FROM reportes ORDER BY nombre');
  res.json(rows);
}));

// Un reporte con sus datos
router.get('/:nombre', w(async (req, res) => {
  await db.listo;
  const [rows] = await db.query('SELECT nombre, titulo, datos, generado_en FROM reportes WHERE nombre = ?',
    [req.params.nombre]);
  if (!rows.length) return res.status(404).json({ error: 'Reporte no existe (¿ya se ejecutó el job de Spark?)' });
  res.json({ ...rows[0], datos: objeto(rows[0].datos) });
}));

module.exports = router;
