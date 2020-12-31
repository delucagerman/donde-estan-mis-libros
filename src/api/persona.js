const express = require('express');
const router = express.Router();

const PersonaModel = require('../models/persona');
const LibroModel = require("../models/libro");

router.post('/', async(req, res, next) => {
    const persona = new PersonaModel({
        nombre: req.body.nombre.toUpperCase(),
        apellido: req.body.apellido.toUpperCase(),
        alias: req.body.alias.toUpperCase(),
        email: req.body.email.toLowerCase()
    });
    try {
        const personaGuardada = await persona.save();
        res.status(201).json(personaGuardada);
    } catch (error) {
        res.status(413);
        res.send('"Faltan datos", "El email ya se encuentra registrado", "error inesperado"');
        next(error);
    }
});

router.get('/', async(req, res) => {
    try {
        const persona = await PersonaModel.find();
        res.status(200).json(persona);
    } catch (error) {
        res.status(413);
        res.send("mensaje: 'Error inesperado'");
        next(error)
    }
});
router.get('/:id', async(req, res) => {
    const { id } = req.params;
    try {
        const persona = await PersonaModel.findById(id);
        res.status(200).json(persona);
    } catch (error) {
        res.status(413);
        res.send("mensaje: 'Error inesperado', 'No se encuentra esa persona'");
        next(error)
    }
});


router.put('/:id', async(req, res) => {
    const { id } = req.params;
    try {
        const updatedPersona = await PersonaModel.findByIdAndUpdate(id, {
            nombre: req.body.nombre.toUpperCase(),
            apellido: req.body.apellido.toUpperCase(),
            alias: req.body.alias.toUpperCase(),
        }, { new: true });
        res.status(200).json(updatedPersona);
    } catch (error) {
        console.log(error);
        res.status(413).send("mensaje: 'Error inesperado', 'Solo se pude modificar la descripcion del libro'");
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
      console.log("Se borro correctamente");
      res.status(200).json(personaBorrada);
    }
    res
      .status(413)
      .send({
        mensaje:
          "No se puede borrar a la persona porque tiene libros prestados.",
      });
  } catch (error) {
    res.status(413).send(error, {
      mensaje:
        "Error inesperado, No existe esa persona, Esa persona tiene libros asociados no se puede eliminar",
    });
    next(error);
  }
});

module.exports = router;
