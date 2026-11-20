const router = require('express').Router();
const c = require('../controllers/usuarioController');
const w = (fn) => (req, res) => fn(req, res).catch(e => res.status(500).json({ error: e.message }));

router.post('/login', w(c.login));   // debe ir antes de '/:id'
router.get('/', w(c.listar));
router.get('/:id', w(c.obtener));
router.post('/', w(c.crear));
router.put('/:id', w(c.actualizar));
router.delete('/:id', w(c.borrar));
router.put('/:id/saldo', w(c.saldo));

module.exports = router;