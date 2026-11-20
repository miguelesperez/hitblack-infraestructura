require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/partidos', require('./src/routes/partidos'));

app.listen(process.env.PORT, () => console.log('Servicio PARTIDOS en puerto ' + process.env.PORT));
