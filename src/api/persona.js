const express = require("express");
const router = express.Router();

const PersonaModel = require("../models/persona");
const LibroModel = require("../models/libro");

router.post("/", async (req, res, next) => {
  const persona = new PersonaModel({
    nombre: req.body.nombre.toUpperCase(),
    apellido: req.body.apellido.toUpperCase(),
    alias: req.body.alias.toUpperCase(),
    email: req.body.email.toLowerCase(),
  });
  try {
    const personaGuardada = await persona.save();
    res.status(201).json(personaGuardada);
  } catch (error) {
    res.status(413);
    res.send({
      mensaje:
        "Faltan datos, El email ya se encuentra registrado, error inesperado",
    });
    next(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const persona = await PersonaModel.find();
    res.status(200).json(persona);
  } catch (error) {
    res.status(413);
    res.send({ mensaje: "Error inesperado" });
    next(error);
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const persona = await PersonaModel.findById(id);
    const libro = await LibroModel.find({ persona_id: persona.id });
    if (libro == "") {
      res.status(200).send({ mensaje: "Esta persona no tiene ningun libro" });
    }
    res.status(200).json(libro);
  } catch (error) {
    res.status(413);
    res.send({ mensaje: "Error inesperado, No se encuentra esa persona" });
    next(error);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedPersona = await PersonaModel.findByIdAndUpdate(
      id,
      {
        nombre: req.body.nombre.toUpperCase(),
        apellido: req.body.apellido.toUpperCase(),
        alias: req.body.alias.toUpperCase(),
      },
      { new: true }
    );
    res.status(200).json(updatedPersona);
  } catch (error) {
    console.log(error);
    res.status(413).send({
      mensaje:
        "Error inesperado, Solo se pude modificar la descripcion del libro",
    });
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const persona = await PersonaModel.findById(id);
    const libro = await LibroModel.find({ persona_id: persona.id });
    if (libro == "") {
      const personaBorrada = await PersonaModel.findByIdAndDelete(id);
      res.status(200).send({ mensaje: "Se borro correctamente" });
    }
    res.status(200).send({
      mensaje: "Esa persona tiene libros asociados, no se puede eliminar.",
    });
  } catch (error) {
    res.status(413).send(error, {
      mensaje: "Error inesperado, No existe esa persona.",
    });
    next(error);
  }
});

module.exports = router;
