require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const middlewares = require('./middlewares');
const mongoose = require('mongoose');

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

//RUTAS
//app.use('/api', router);
app.use('/categoria', categoriaRouter);
app.use('/persona', personaRouter);
app.use('/libro', libroRouter);

app.use(middlewares.noEncontrado);
app.use(middlewares.manejadorDeErrores);

module.exports = app;