const Apuesta = require('../models/apuesta');

const PARTIDOS = process.env.PARTIDOS_SERVICE_URL;
const USUARIOS = process.env.USUARIOS_SERVICE_URL;
const JSON_H = { 'Content-Type': 'application/json' };

exports.listar = async (req, res) => res.json(await Apuesta.todas());

exports.listarPorUsuario = async (req, res) =>
  res.json(await Apuesta.porUsuario(req.params.usuario_id));

exports.crear = async (req, res) => {
  const { usuario_id, partido_id, tipo, monto } = req.body;
  if (!usuario_id || !partido_id || !['LOCAL', 'EMPATE', 'VISITANTE'].includes(tipo) || !(monto > 0))
    return res.status(400).json({ error: 'Datos inválidos' });

  // 1. Consultar el partido en PARTIDOS
  const rp = await fetch(`${PARTIDOS}/partidos/${partido_id}`);
  if (!rp.ok) return res.status(404).json({ error: 'Partido no existe' });
  const partido = await rp.json();
  if (partido.estado !== 'PENDIENTE')
    return res.status(409).json({ error: 'El partido ya finalizó' });

  // 2. Consultar el usuario en USUARIOS
  const ru = await fetch(`${USUARIOS}/usuarios/${usuario_id}`);
  if (!ru.ok) return res.status(404).json({ error: 'Usuario no existe' });
  const usuario = await ru.json();
  if (Number(usuario.saldo) < monto)
    return res.status(400).json({ error: 'Saldo insuficiente' });

  // 3. Descontar el saldo en USUARIOS
  const rs = await fetch(`${USUARIOS}/usuarios/${usuario_id}/saldo`, {
    method: 'PUT', headers: JSON_H, body: JSON.stringify({ monto: -monto })
  });
  if (!rs.ok) return res.status(400).json({ error: 'No se pudo descontar el saldo' });

  // 4. Guardar la apuesta
  const cuota = Number(partido['cuota_' + tipo.toLowerCase()]);
  const ganancia = +(monto * cuota).toFixed(2);
  const id = await Apuesta.crear({
    usuario_id, usuario: usuario.usuario, email: usuario.email,
    partido_id, tipo, monto, cuota, ganancia_potencial: ganancia
  });
  res.status(201).json({ id, cuota, ganancia_potencial: ganancia });
};

exports.liquidar = async (req, res) => {
  const { resultado } = req.body;
  const pendientes = await Apuesta.pendientesPorPartido(req.params.partido_id);
  let ganadas = 0;
  for (const a of pendientes) {
    if (a.tipo === resultado) {
      await Apuesta.marcar(a.id, 'GANADA');
      await fetch(`${USUARIOS}/usuarios/${a.usuario_id}/saldo`, {
        method: 'PUT', headers: JSON_H, body: JSON.stringify({ monto: Number(a.ganancia_potencial) })
      });
      ganadas++;
    } else {
      await Apuesta.marcar(a.id, 'PERDIDA');
    }
  }
  res.json({ liquidadas: pendientes.length, ganadas });
};
