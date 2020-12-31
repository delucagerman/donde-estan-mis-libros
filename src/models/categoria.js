const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
        trim: true,

    }
}, {
    versionKey: false
});
const CategoriaModel = mongoose.model('categoria', CategoriaSchema);

module.exports = CategoriaModel;