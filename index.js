const { conexion } = require("./basedatos/conexion");
const express = require("express")
const cors = require("cors")

// iniciar app
console.log("App de node arrancada");


// Conectar a base de datos
conexion();

// Crear servidor de node
const app = express();
const puerto = 3900;

// Configurar cors
app.use(cors());

// convertir body a objeto js
app.use(express.json()); // recibir datos con content- type app/json
app.use(express.urlencoded({extended:true})); // form-url-encoer

// Crear rutas
const rutas_articulo = require("./rutas/articulo")

//cargo las rutas
app.use("/api", rutas_articulo)


// rutaqs pruebas
app.get("/probando", (req, res)=> {

    console.log("Se ha ejecutado el endpoint probando")

    return res.status(200).json([{
        curso: "Master en React"
    },
    {
        curso: "Master en React"
    }
    ]);

}),


// Crear servidores y escuchar peticiones http
app.listen(puerto, () => {
    console.log("servidor corriendo en el puerto"+ " " +puerto);
});