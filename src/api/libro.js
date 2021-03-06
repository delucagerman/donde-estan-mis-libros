const express = require("express");
const router = express.Router();

const LibroModel = require("../models/libro");
const CategoriaModel = require("../models/categoria");
const PersonaModel = require("../models/persona");

router.post("/", async (req, res, next) => {
  let guardar = true;
  try {
    //Validacion de datos

    if (
      !req.body.nombre ||
      req.body.nombre == "" ||
      !req.body.categoria_id ||
      req.body.categoria_id == ""
    ) {
      guardar = false;
      res.status(413).send({
        mensaje: "Falta nombre o categoria.",
      });
    }
    const libro = new LibroModel({
      nombre: req.body.nombre.toUpperCase(),
      descripcion: req.body.descripcion.toUpperCase(),
      categoria_id: req.body.categoria_id,
      persona_id: req.body.persona_id ? req.body.persona_id : [],
    });

    try {
      const existeLibro = await LibroModel.findOne({
        nombre: req.body.nombre.toUpperCase(),
      });
      if (existeLibro) {
        guardar = false;
        res.status(413).send({
          mensaje: "Ese libro ya se encuentra registrado",
        });
      }
    } catch (error) {}

    try {
      categoria = await CategoriaModel.findOne({ _id: req.body.categoria_id });
    } catch (e) {
      guardar = false;
      res.status(413).send({
        mensaje: "La categoria seleccionada no existe",
      });
    }

    if (req.body.persona_id) {
      try {
        persona = await PersonaModel.findOne({ _id: req.body.persona_id });
      } catch (e) {
        guardar = false;
        res.status(413).send({
          mensaje: "Esa persona no se encuentra registrada",
        });
      }
    }
    if (guardar) {
      const libroGuardado = await libro.save();
      res.status(200).json(libroGuardado);
    } else {
      res.status(413).send({
        mensaje: "No se ha podido guardar el libro",
      });
    }
  } catch (e) {
    res.status(413).send({ mensaje: e });
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const libro = await LibroModel.find()
      .populate("persona_id")
      .populate("categoria_id");
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

router.get("/ctLibro/:id", async (req, res, next) => {
  const { id } = req.params;
  var libros = [];
  try {
    const libro = await LibroModel.find()
    for (let index = 0; index < libro.length; index++) {
      if(libro[index].categoria_id[0] == id){
        libros.push(libro[index])
      }
    }
    res.status(200).json(libros);
  } catch (error) {
    res.status(413);
    res.send({ mensaje: "No se encuentran libros bajo esa categoría" });
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const updatedLibro = await LibroModel.findByIdAndUpdate(
      id,
      { descripcion: req.body.descripcion.toUpperCase() },
      { new: true }
    );
    res.status(200).json(updatedLibro);
  } catch (error) {
    res.status(413).send({
      mensaje: "Ocurrió un error inesperado",
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
        mensaje: "No se encuentra ese libro",
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
    res.status(413).send(error);
  }
});

router.put("/prestar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    try {
      persona = await PersonaModel.findOne({ _id: req.body.persona_id });
    } catch (error) {
      res.status(413).send({
        mensaje:
          "No se encontro la persona a la que se quiere prestar el libro",
      });
    }

    try {
      libro = await LibroModel.findOne({ _id: id });
    } catch (error) {
      res.status(413).send({
        mensaje: "No se encontró el libro",
      });
    }

    var libro = await LibroModel.findOne({ _id: id });
    if (!libro.persona_id[0]) {
      LibroModel.findByIdAndUpdate(
        id,
        { persona_id: req.body.persona_id },
        function (err, docs) {
          if (err) {
            console.log(err);
          } else {
            res.status(200).send({ mensaje: "se presto correctamente" });
          }
        }
      );
    } else {
      res.status(413).send({
        mensaje:
          "el libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(413).send({ mensaje: "Ocurrio un error inesperado" });
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
        mensaje: "No se encuentra ese libro",
      });
    }

    try {
      var estaPrestado = await LibroModel.findById(id);

      if (estaPrestado.persona_id[0] != undefined) {
        res.status(413).send({
          mensaje: "ese libro esta prestado no se puede borrar",
        });
      } else {
        libroBorrado = await LibroModel.findByIdAndDelete(id);
        res.status(200).send({ mensaje: "Se borro correctamente." });
      }
    } catch (error) {
      res.status(413).send({
        mensaje: estaPrestado,
      });
    }

    //const respuesta = await categoriaModel.find();
  } catch (error) {
    res.status(413).send({
      mensaje: "Error inesperado",
    });
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const libro = await LibroModel.findById(id);
    if (libro.persona_id[0] != undefined && libro.persona_id[0] != []) {
      res.status(413).send({
        mensaje: "Ese libro eta prestado no se puede eliminar",
      });
    } else {
      const libroBorrado = await LibroModel.findByIdAndDelete(id);
      res.status(200).send({ mensaje: "Se borro correctamente." });
    }

    //const respuesta = await categoriaModel.find();
  } catch (error) {
    res.status(413).send({
      mensaje:
        "Error inesperado, No se encuentra es libro, Ese libro eta prestado no se puede eliminar",
    });
    next(error);
  }
});

module.exports = router;
