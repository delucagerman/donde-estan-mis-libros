const express = require("express");
const router = express.Router();

const PersonaModel = require("../models/persona");
const LibroModel = require("../models/libro");

router.post("/", async (req, res, next) => {
  try {
    //Validacion de datos
    if (!req.body.nombre || req.body.nombre == "") {
      res.status(413).send({ mensaje: "Falta el nombre por completar" });
    }
    if (!req.body.apellido || req.body.apellido == "") {
      res.status(413).send({ mensaje: "Falta el apellido por completar" });
    }
    if (!req.body.alias || req.body.alias == "") {
      res.status(413).send({ mensaje: "Falta el alias por completar" });
    }
    if (!req.body.email || req.body.email == "") {
      res.status(413).send({ mensaje: "Falta el email por completar" });
    }

    const persona = new PersonaModel({
      nombre: req.body.nombre.toUpperCase(),
      apellido: req.body.apellido.toUpperCase(),
      alias: req.body.alias.toUpperCase(),
      email: req.body.email.toLowerCase(),
    });

    const existePersona = await PersonaModel.findOne({
      email: req.body.email.toLowerCase(),
    });
    if (existePersona) {
      res.status(413).send({ mensaje: "El email ya se encuentra registrado" });
    }

    const personaGuardada = await persona.save();
    res.status(201).json(personaGuardada);
  } catch (error) {
    res.status(413).send({
      mensaje: "Error inesperado",
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
    if (persona == null) {
      res.status(413);
      res.send({ mensaje: "no se encuentra esa persona" });
    } else {
      res.status(200).send({ mensaje: persona });
    }
  } catch (error) {
    res.status(413);
    res.send({ mensaje: "error inesperado" });
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
      mensaje: "No se encuentra esa persona",
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
    res.status(413).send({
      mensaje: "Esa persona tiene libros asociados, no se puede eliminar.",
    });
  } catch (error) {
    res.status(413).send({
      mensaje: "No existe esa persona.",
    });
    next(error);
  }
});

module.exports = router;
