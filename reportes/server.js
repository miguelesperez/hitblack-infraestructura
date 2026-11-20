require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/reportes', require('./src/routes/reportes'));

app.listen(process.env.PORT, () => console.log('Servicio REPORTES en puerto ' + process.env.PORT));
