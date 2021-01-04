const express = require("express");
const router = express.Router();

const LibroModel = require("../models/libro");
const CategoriaModel = require("../models/categoria");

router.post("/", async (req, res, next) => {
  try {
    //Validacion de datos
    if (!req.body.nombre || req.body.nombre == '' || !req.body.categoria_id || req.body.categoria_id == '') {
      res.status(413).send("Nombre y Categoria son datos obligatorios");
    }
    const libro = new LibroModel({
      nombre: req.body.nombre.toUpperCase(),
      descripcion: req.body.descripcion.toUpperCase(),
      categoria_id: req.body.categoria_id,
      persona_id: req.body.persona_id,
    });

    const existeLibro = await LibroModel.findOne({ nombre: req.body.nombre.toUpperCase() });
    if (existeLibro) {
      res.status(413).send({ message: "Ese libro ya existe" });
    }

    // // Categoria no encontrada
    try {
      const categoria = await CategoriaModel.findById(req.body.categoria_id);
    } catch (error) {
      res.status(413).send({ message: "Categoria no encontrada" });
      next(error);
    }

    const libroGuardado = await libro.save();
    res.status(201).json(libroGuardado);

  } catch (error) {
    res.status(413).send({
      mensaje:
        "No existe la persona indicada"
    });
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const libro = await LibroModel.find();
    //const libro = await LibroModel.find().populate('persona_id');
    //populate muestra todos los datos de la persona que tiene el libro
    res.status(200).json(libro);
  } catch (error) {
    res.status(413);
    res.send({ mensaje: "Error inesperado" });
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    //const libro = await LibroModel.findById(id);
    const libro = await LibroModel.findById(id).populate("persona_id");
    //populate muestra todos los datos de la persona que tiene el libro
    if(!libro) {
      res.status(413).send({ mensaje: "Error inesperado: El libro no existe" });
    }
    res.status(200).json(libro);
  } catch (error) {
    res.status(413).send({ mensaje: "Error inesperado: No se encuentra ese libro" });
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    if ( req.body.nombre || req.body.id || req.body.categoria_id || req.body.persona_id ) {
      res.status(413).send({
        mensaje:
          "Solo se puede modificar la descripcion del libro",
      });
    }
    const updatedLibro = await LibroModel.findByIdAndUpdate(
      id,
      { descripcion: req.body.descripcion.toUpperCase() },
      { new: true }
    );
    res.status(200).json(updatedLibro);
  } catch (error) {
    res.status(413).send({
      mensaje:
        "Error inesperado",
    });
    next(error);
  }
});

router.put("/devolver/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const estaPrestado = await LibroModel.findById(id);
    if (estaPrestado.persona_id[0] != undefined) {
      //Detecta si el libro se encuentra prestado
      const updateDevolver = await LibroModel.findByIdAndUpdate(
        id,
        { persona_id: [] },
        { new: true }
      );
      res
        .status(200)
        .send({ mensaje: "Se realizo la devolución correctamente." });
    } else {
      res.status(413).send({ mensaje: "Ese libro no estaba prestado!" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(413)
      .send({ mensaje: "Error inesperado: No se encuentra ese libro" });
  }
});


router.put("/prestar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const estaPrestado = await LibroModel.findById(id);
    if (estaPrestado.persona_id[0] == undefined) {
      //Detecta si el libro no se encuentra prestado
      const updatePrestado = await LibroModel.findByIdAndUpdate(
        id,
        { persona_id: [req.body.persona_id] },
        { new: true }
      );
      res.status(200).send({ mensaje: "Se presto correctamente." });
    } else {
      res.status(413).send({
        mensaje:
          "El libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva.",
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(413)
      .send({ mensaje: "Error inesperado: No se encontro la persona a la que se quiere prestar el libro" });
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const estaPrestado = await LibroModel.findById(id);
    if (estaPrestado.persona_id[0] == undefined) {
      //Detecta si el libro no se encuentra prestado
      const libroBorrado = await LibroModel.findByIdAndDelete(id);
      res.status(200).send({ mensaje: "Se borro correctamente." });
    } else {
      res.status(413).send({
        mensaje:
          "El libro se encuentra prestado, no se puede eliminar",
      });
    }
;
  } catch (error) {
    res.status(413).send({
      mensaje:
        "Error inesperado: No se encuentra es libro",
    });
    next(error);
  }
});

module.exports = router;

