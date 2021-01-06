const express = require("express");
const router = express.Router();

const LibroModel = require("../models/libro");
const CategoriaModel = require("../models/categoria");
const PersonaModel = require("../models/persona")

router.post("/", async(req, res, next) => {
    try {
        //Validacion de datos

        if (!req.body.nombre || req.body.nombre == '' || !req.body.categoria_id || req.body.categoria_id == '') {
            res.status(413).send("Nombre y Categoria son datos obligatorios");
        }
        const libro = new LibroModel({
            nombre: req.body.nombre.toUpperCase(),
            descripcion: req.body.descripcion.toUpperCase(),
            categoria_id: req.body.categoria_id,
            persona_id: req.body.persona_id != '' ? req.body.persona_id : []
        });

        const existeLibro = await LibroModel.findOne({ nombre: req.body.nombre.toUpperCase() });
        if (existeLibro) {
            res.status(413).send({ message: "Ese libro ya existe" });
        }

        try {
            categoria = await CategoriaModel.findOne({ _id: req.body.categoria_id });
        } catch (error) {
            res.status(413).send({ message: "no existe la categoria indicada" });
        }

        if (req.body.persona_id != '') {
            try {
                categoria = await PersonaModel.findOne({ _id: req.body.persona_id });
            } catch (error) {
                res.status(413).send({ message: "no existe la persona indicada" });
            }
        }

        const libroGuardado = await libro.save();
        res.status(201).json(libroGuardado);

    } catch (error) {
        res.status(413).send({
            mensaje: error
        });
        next(error);
    }
});



router.get("/", async(req, res, next) => {
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
router.get("/:id", async(req, res, next) => {
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

router.put("/:id", async(req, res, next) => {
    const { id } = req.params;
    try {
        libro = await LibroModel.findOne({ _id: req.body.id });

        if (req.body.nombre.toUpperCase() == libro.nombre.toUpperCase() &&
            req.body.id == libro.id && req.body.persona_id == libro.persona_id &&
            req.body.categoria_id == libro.categoria_id) {
            const updatedLibro = await LibroModel.findByIdAndUpdate(
                id, { descripcion: req.body.descripcion.toUpperCase() }, { new: true }
            );
            res.status(200).json(updatedLibro);
        } else {
            res.status(413).send({
                mensaje: "Solo se pude modificar la descripcion del libro",
            });
        }
    } catch (error) {
        res.status(413).send({
            mensaje: "Ocurrió un error inesperado",
        });
        next(error);
    }
});

router.put("/devolver/:id", async(req, res) => {
    const { id } = req.params;
    try {
        const estaPrestado = await LibroModel.findById(id);
        if (estaPrestado.persona_id[0] != undefined) {
            //Detecta si el libro se encuentra prestado
            const updateDevolver = await LibroModel.findByIdAndUpdate(
                id, { persona_id: [] }, { new: true }
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
            .send({ mensaje: "Error inesperado, No Se encuentra esa persona" });
    }
});

router.put("/prestar/:id", async(req, res) => {
    const { id } = req.params;
    try {
        const estaPrestado = await LibroModel.findById(id);
        if (estaPrestado.persona_id[0] == undefined) {
            //Detecta si el libro no se encuentra prestado
            const updatePrestado = await LibroModel.findByIdAndUpdate(
                id, { persona_id: [req.body.persona] }, { new: true }
            );
            res.status(200).send({ mensaje: "Se presto correctamente." });
        } else {
            res.status(413).send({
                mensaje: estaPrestado
            });
        }
    } catch (error) {
        console.log(error);
        res
            .status(413)
            .send({ mensaje: "Error inesperado, No Se encuentra esa persona" });
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