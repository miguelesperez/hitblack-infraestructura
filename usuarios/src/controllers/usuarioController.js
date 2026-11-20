const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');

exports.listar = async (req, res) => res.json(await Usuario.todos());

exports.obtener = async (req, res) => {
  const u = await Usuario.porId(req.params.id);
  if (!u) return res.status(404).json({ error: 'Usuario no existe' });
  res.json(u);
};

exports.crear = async (req, res) => {
  const { nombre, email, usuario, password } = req.body;
  if (!nombre || !email || !usuario || !password)
    return res.status(400).json({ error: 'Faltan campos' });
  if (await Usuario.porUsuario(usuario))
    return res.status(409).json({ error: 'Ese usuario ya existe' });
  const hash = await bcrypt.hash(password, 10);
  res.status(201).json({ id: await Usuario.crear({ nombre, email, usuario, password: hash }) });
};

exports.actualizar = async (req, res) => {
  const n = await Usuario.actualizar(req.params.id, req.body);
  if (!n) return res.status(404).json({ error: 'Usuario no existe' });
  res.json({ mensaje: 'Actualizado' });
};

exports.borrar = async (req, res) => {
  const n = await Usuario.borrar(req.params.id);
  if (!n) return res.status(404).json({ error: 'Usuario no existe' });
  res.json({ mensaje: 'Borrado' });
};

exports.login = async (req, res) => {
  const { usuario, password } = req.body;
  const u = await Usuario.porUsuario(usuario);
  if (!u || !(await bcrypt.compare(password, u.password)))
    return res.status(401).json({ error: 'Credenciales inválidas' });
  res.json(await Usuario.porId(u.id));
};

exports.saldo = async (req, res) => {
  const monto = Number(req.body.monto);
  if (!monto) return res.status(400).json({ error: 'monto inválido' });
  const n = await Usuario.ajustarSaldo(req.params.id, monto);
  if (!n) return res.status(400).json({ error: 'Usuario no existe o saldo insuficiente' });
  res.json(await Usuario.porId(req.params.id));
};