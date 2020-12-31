const express = require('express');
const router = express.Router();

const CategoriaModel = require('../models/categoria')
const LibroModel = require("../models/libro");

router.post('/', async(req, res, next) => {
    const categoria = new CategoriaModel({
        nombre: req.body.nombre.toUpperCase()
    });
    try {
        const categoriaGuardada = await categoria.save();
        res.status(201).json(categoriaGuardada);
    } catch (error) {
        res.status(413);
        res.send("mensaje:'faltan datos', 'ese nombre de categoria ya existe', 'error inesperado'");
        next(error);
    }
});

router.get('/', async(req, res, next) => {
    try {
        const categoria = await CategoriaModel.find();
        res.status(200).json(categoria);
    } catch (error) {
        res.status(413);
        res.send("mensaje:'Error inesperado'");
        next(error);
    }
});
router.get('/:id', async(req, res, next) => {
    const { id } = req.params;
    try {
        const categoria = await CategoriaModel.findById(id);
        res.status(200).json(categoria);
    } catch (error) {
        res.status(413);
        res.send("mensaje: 'Error inesperado, Categoria no encontrada'");
        next(error);
    }
});


router.delete("/:id", async(req, res, next) => {
    const { id } = req.params;
    try {
        const categoria = await CategoriaModel.findById(id);
        const libro = await LibroModel.find({ categoria_id: categoria.id });
        if (libro == "") {
            const categoriaBorrada = await CategoriaModel.findByIdAndDelete(id);
            res.status(200).json(categoriaBorrada);
        }
        res.status(413).send({
            mensaje: "La categoria no se puede borrar ya que tiene libros asociados.",
        });
    } catch (error) {
        res.status(413).send({
            mensaje: "Error inesperado, Categoria con libros asociados no se puede eliminar, No existe Categoria indicada",
        });
        next(error);
    }
});

module.exports = router;