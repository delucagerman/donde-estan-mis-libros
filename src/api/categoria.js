const express = require("express");
const router = express.Router();

const CategoriaModel = require("../models/categoria");
const LibroModel = require("../models/libro");

router.post("/", async (req, res, next) => {
  try {
    //Validacion de datos
    if (!req.body.nombre || req.body.nombre == "") {
      res.status(413).send({ mensaje: "Faltan datos por completar" });
    }
    const categoria = new CategoriaModel({
      nombre: req.body.nombre.toUpperCase(),
    });
    const categoriaGuardada = await categoria.save();
    res.status(200).json(categoriaGuardada);
    console.log(categoriaGuardada);
  } catch (error) {
    res.status(413).send({ mensaje: "Ese nombre de categoria ya existe" });
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const categoria = await CategoriaModel.find();
    res.status(200).json(categoria);
  } catch (error) {
    res.status(413);
    res.send({ mensaje: "Error inesperado" });
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const categoria = await CategoriaModel.findById(id);
    res.status(200).json(categoria);
  } catch (error) {
    res.status(413);
    res.status(413).send({ mensaje: "Categoria no encontrada" });
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const categoria = await CategoriaModel.findById(id);
    const libro = await LibroModel.find({ categoria_id: categoria.id });
    if (libro == "") {
      const categoriaBorrada = await CategoriaModel.findByIdAndDelete(id);
      res.status(200).send({ mensaje: "La categoria se borro correctamente." });
    }
    res.status(413).send({
      mensaje: "Categoria con libros asociados, no se puede eliminar.",
    });
  } catch (error) {
    res.status(413).send({
      mensaje: "No existe Categoria indicada",
    });
    next(error);
  }
});

module.exports = router;
