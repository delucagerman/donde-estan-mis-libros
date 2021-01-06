require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const middlewares = require('./middlewares');
<<<<<<< HEAD
const cors = require('cors');
=======
const mongoose = require('mongoose');
>>>>>>> bc40207a4341ea33ad0fb8edf1bd5576715f7891

//const router = require('./api');
const categoriaRouter = require('./api/categoria');
const personaRouter = require('./api/persona');
const libroRouter = require('./api/libro');

const db = require('./db');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

//RUTAS
//app.use('/api', router);
app.use('/categoria', categoriaRouter);
app.use('/persona', personaRouter);
app.use('/libro', libroRouter);

app.use(middlewares.noEncontrado);
app.use(middlewares.manejadorDeErrores);

module.exports = app;