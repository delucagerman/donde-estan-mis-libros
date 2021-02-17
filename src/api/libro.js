const express = require("express");
const router = express.Router();

const LibroModel = require("../models/libro");
const CategoriaModel = require("../models/categoria");
const PersonaModel = require("../models/persona")

router.post("/", async (req, res, next) => {
  let guardar = true;
  let error = [];
  try {
    //Validacion de datos

    if (
      !req.body.nombre ||
      req.body.nombre == "" ||
      !req.body.categoria_id ||
      req.body.categoria_id == ""
    ) {
      guardar = false;
      error.push("Falta nombre o categoria.");
    }
    const libro = new LibroModel({
      nombre: req.body.nombre.toUpperCase(),
      descripcion: req.body.descripcion.toUpperCase(),
      categoria_id: req.body.categoria_id,
      persona_id: req.body.persona_id ? req.body.persona_id : [],
    });

    const existeLibro = await LibroModel.findOne({
      nombre: req.body.nombre.toUpperCase(),
    });
    if (existeLibro) {
      guardar = false;
      error.push("Ese libro ya se encuentra registrado");
    }

    try {
      categoria = await CategoriaModel.findOne({ _id: req.body.categoria_id });

      if (!categoria) {
        guardar = false;
        error.push("No existe la categoria seleccionada");
      }
    } catch (e) {
      guardar = false;
      error.push("Error inesperado", e);
    }

    if (req.body.persona_id) {
      try {
        persona = await PersonaModel.findOne({ _id: req.body.persona_id });

        if (!persona) {
          guardar = false;
          error.push("Esa persona no se encuentra registrada");
        }
      } catch (e) {
        guardar = false;
        error.push("Error inesperado", e);
      }
    }
    if (guardar) {
      const libroGuardado = await libro.save();
      res.status(200).json(libroGuardado);
    } else {
      res.status(413).send(error);
    }
  } catch (e) {
    res.status(413).send("Error inesperado", e);
    next(e);
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
    res.status(200).json(libro);
  } catch (error) {
    res.status(413);
    res.send({ mensaje: "No se encuentra ese libro" });
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    libro = await LibroModel.findOne({ _id: req.body.id });

    if (req.body.nombre.toUpperCase() == libro.nombre.toUpperCase()
      && req.body.id == libro.id && req.body.persona_id == libro.persona_id
      && req.body.categoria_id == libro.categoria_id) {
      const updatedLibro = await LibroModel.findByIdAndUpdate(
        id,
        { descripcion: req.body.descripcion.toUpperCase() },
        { new: true }
      );
      res.status(200).json(updatedLibro);
    } else {
      res.status(413).send({
        mensaje:
          "Solo se pude modificar la descripcion del libro",
      });
    }
  } catch (error) {
    res.status(413).send({
      mensaje:
        "Ocurrió un error inesperado",
    });
    next(error);
  }
});

router.put("/devolver/:id", async (req, res) => {
  const { id } = req.params;
  try {

    try {
      var revisarSiExiste = await LibroModel.findById(id);
    } catch (error) {
      res.status(413).send({
        mensaje:
          "No se encuentra ese libro",
      });
    }

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
      .send({ mensaje: "Ocurrio un error inesperado" });
  }
});

router.put("/prestar/:id", async (req, res) => {
  try {

    try {
      persona = await PersonaModel.findOne({ _id: req.body.persona_id });
    } catch (error) {
      res.status(413).send({
        mensaje: "no se encontro la persona a la que se quiere prestar el libro"
      });
    }

    try {
      libro = await LibroModel.findOne({ _id: req.body.id });
    } catch (error) {
      res.status(413).send({
        mensaje: "No se encontró el libro"
      });
    }

    var libro = await LibroModel.findOne({ _id: req.body.id });
    if (!libro.persona_id[0]) {
      LibroModel.findByIdAndUpdate(req.body.id, { persona_id: req.body.persona_id },
        function (err, docs) {
          if (err) {
            console.log(err)
          }
          else {
            res.status(200).send({ mensaje: "se presto correctamente" });
          }
        });
    } else {
      res.status(413).send({
        mensaje: "el libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva"
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(413)
      .send({ mensaje: "Ocurrio un error inesperado" });
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  var libroBorrado = [];
  try {
    try {
      libroBorrado = await LibroModel.findById(id);
    } catch (error) {
      res.status(413).send({
        mensaje:
          "No se encuentra ese libro",
      });
    }

    try {
      var estaPrestado = await LibroModel.findById(id);

      if (estaPrestado.persona_id[0] != undefined) {
        res.status(413).send({
          mensaje:
          "ese libro esta prestado no se puede borrar"
        });
      } else {
        libroBorrado = await LibroModel.findByIdAndDelete(id);
        res.status(200).send({ mensaje: "Se borro correctamente." });
      }
    } catch (error) {
      res.status(413).send({
        mensaje:
          estaPrestado,
      });
    }
 
    //const respuesta = await categoriaModel.find();
  } catch (error) {
    res.status(413).send({
      mensaje:
        "Error inesperado",
    });
    next(error);
  }
});

router.delete("/:id", async(req, res, next) => {
    const { id } = req.params;
    try {
        const libro = await LibroModel.findById(id);
        if (libro.persona_id[0] != undefined && libro.persona_id[0] != []) {
            res.status(413).send({
                mensaje: "Ese libro eta prestado no se puede eliminar"
            })
        } else {
            const libroBorrado = await LibroModel.findByIdAndDelete(id);
            res.status(200).send({ mensaje: "Se borro correctamente." });
        }

        //const respuesta = await categoriaModel.find();
    } catch (error) {
        res.status(413).send({
            mensaje: "Error inesperado, No se encuentra es libro, Ese libro eta prestado no se puede eliminar",
        });
        next(error);
    }
});

module.exports = router;
