const Partido = require('../models/partido');

exports.listar = async (req, res) => res.json(await Partido.todos());

exports.obtener = async (req, res) => {
  const p = await Partido.porId(req.params.id);
  if (!p) return res.status(404).json({ error: 'Partido no existe' });
  res.json(p);
};

exports.crear = async (req, res) => {
  const b = req.body;
  if (!b.equipo_local || !b.equipo_visitante || !b.fecha || !b.cuota_local || !b.cuota_empate || !b.cuota_visitante)
    return res.status(400).json({ error: 'Faltan campos' });
  res.status(201).json({ id: await Partido.crear(b) });
};

exports.actualizar = async (req, res) => {
  const n = await Partido.actualizar(req.params.id, req.body);
  if (!n) return res.status(404).json({ error: 'Partido no existe' });
  res.json({ mensaje: 'Actualizado' });
};

exports.borrar = async (req, res) => {
  const n = await Partido.borrar(req.params.id);
  if (!n) return res.status(404).json({ error: 'Partido no existe' });
  res.json({ mensaje: 'Borrado' });
};

exports.finalizar = async (req, res) => {
  const { resultado } = req.body;
  if (!['LOCAL', 'EMPATE', 'VISITANTE'].includes(resultado))
    return res.status(400).json({ error: 'resultado debe ser LOCAL, EMPATE o VISITANTE' });
  const p = await Partido.porId(req.params.id);
  if (!p) return res.status(404).json({ error: 'Partido no existe' });
  if (p.estado === 'FINALIZADO') return res.status(409).json({ error: 'Ya finalizado' });
  await Partido.finalizar(req.params.id, resultado);
  const r = await fetch(`${process.env.APUESTAS_SERVICE_URL}/apuestas/liquidar/${req.params.id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resultado })
  });
  res.json({ mensaje: 'Partido finalizado', liquidacion: await r.json() });
};
