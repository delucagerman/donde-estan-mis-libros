const app = require("./app");

const PORT = process.env.PORT || 3001;
//CONEXION A PUERTO
app.listen(PORT, () => {
  console.log(`Escuchando en puerto ${PORT}`);
});
