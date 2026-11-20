require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/apuestas', require('./src/routes/apuestas'));

app.listen(process.env.PORT, () => console.log('Servicio APUESTAS en puerto ' + process.env.PORT));