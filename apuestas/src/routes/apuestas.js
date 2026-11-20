const router = require('express').Router();
const c = require('../controllers/apuestaController');
const w = (fn) => (req, res) => fn(req, res).catch(e => res.status(500).json({ error: e.message }));

router.get('/', w(c.listar));
router.get('/usuario/:usuario_id', w(c.listarPorUsuario));
router.post('/', w(c.crear));
router.put('/liquidar/:partido_id', w(c.liquidar));

module.exports = router;