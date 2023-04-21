const fs = require("fs")
const path = require("path")
const { validarArticulo } = require("../helpers/validar");
const Articulo = require("../modelos/Articulo");
const { arabicLocales } = require("validator/lib/alpha");

const prueba = (req, res) => {
    return res.status(200).json({
        mensaje: "Soy una accion de prueba en mi controlador de articulos"
    });
}

const curso = (req, res) => {

    console.log("Se ha ejecutado el endpoint probando")

    return res.status(200).json([{
        curso: "Master en React"
    },
    {
        curso: "Master en React"
    }
    ]);

}

const crear = (req, res) => {

    // recoger los parametros por post a guardar
    let parametros = req.body;

    // Validar los datos
    try {
        validarArticulo(parametros);
    } catch (error) {
        return res.status(400).json({
            status: "error",
            mensaje: "Faltan datos por enviar"
        });
    };

    // crear el objeto a guardar
    const articulo = new Articulo(parametros);

    // asignar valores a objeto
    articulo.titulo = parametros.titulo;


    // guardar el articulo en la base de datos
    articulo.save()
        .then((articuloGuardado) => {
            if (!articuloGuardado) {
                return res.status(400).json({
                    status: "error",
                    mensaje: "Missing data to send"
                });
            }
            return res.status(200).json({
                status: "success",
                articulo: articuloGuardado,
                mensaje: "Articulo guardado"
            });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({
                status: "error",
                mensaje: "Error al guardar el articulo en la base de datos"
            });
        });


}

const listar = (req, res) => {

    let consulta = Articulo.find({});

    if (req.params.ultimos) {
        consulta.limit(2);
    }



    consulta.sort({ fecha: -1 })
        .then((articulos) => {

            if (!articulos || articulos.length === 0) {
                return res.status(404).json({
                    status: "error",
                    mensaje: "No se han encontrado artículos"
                });
            }

            return res.status(200).send({
                status: "Success",
                contador: articulos.length,
                articulos
            });
        }).catch(error => {
            return res.status(500).json({
                status: "error",
                mensaje: "Error al obtener los artículos"
            });
        })

}

const uno = (req, res) => {
    // recoger id por la url
    let id = req.params.id;


    // buscar el articulo
    Articulo.findById(id)
        // si no existe devolver error
        .then((articulo) => {
            if (!articulo) {
                return res.status(404).json({
                    status: "error",
                    mensaje: "No se han encontrado el artículo",
                });
            }

            // si existe devolver resultado    
            return res.status(200).json({
                status: "success",
                articulo,
            });
        })
        .catch((error) => {
            // handle the error
        });
}

const borrar = (req, res) => {

    let articuloId = req.params.id;




    Articulo.findOneAndDelete({ _id: articuloId })
        .exec()
        .then((articuloBorrado) => {
            if (!articuloBorrado) {
                return res.status(404).json({
                    status: "error",
                    mensaje: "No se ha encontrado el artículo",
                });
            }
            return res.status(200).json({
                status: "success",
                articulo: articuloBorrado,
                mensaje: "Método de borrar",
            });
        })
        .catch((error) => {
            return res.status(500).json({
                status: "error",
                mensaje: "Error interno del servidor",
            });
        });
}

const editar = (req, res) => {
    // recoger id articulo a editar
    let articuloId = req.params.id;

    // recoger datos del body
    let parametros = req.body;

    // validar datos
    try {
        validarArticulo(parametros);
    } catch (error) {
        return res.status(400).json({
            status: "error",
            mensaje: "Faltan datos por enviar"
        });
    };
    // Buscar y actualizar articulo
    Articulo.findOneAndUpdate({ _id: articuloId }, req.body, { new: true })
        .exec()
        .then((articuloActualizado) => {
            if (!articuloActualizado) {
                return res.status(500).json({
                    status: "error",
                    mensaje: "Error al actualizar",
                });
            }
            return res.status(200).json({
                status: "success",
                articulo: articuloActualizado,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                status: "error",
                mensaje: "Error interno del servidor",
            });
        });
}

const subir = (req, res) => {

    // configurar multer


    // recoger el fichero de imagen subido
    if (!req.file && !req.files) {
        return res.status(400).json({
            status: "error",
            mensaje: "Peticion invalida"
        });
    }

    // nombre del archivo
    let archivo = req.file.originalname;


    // extension del archivo
    let archivo_split = archivo.split("\.");
    let extension = archivo_split[1];

    // comprobar extension correcta
    if (extension != "png" && extension != "jpg" &&
        extension != "jpeg" && extension != "gif") {
        // borrar archivo y dar respuesta
        fs.unlink(req.file.path, (error) => {
            return res.status(400).json({
                status: "error",
                mensaje: "Imagen invalida"
            });
        })

    } else {

        // recoger id articulo a editar
        let articuloId = req.params.id;




        // Buscar y actualizar articulo
        Articulo.findOneAndUpdate({ _id: articuloId }, {imagen: req.file.filename}, { new: true })
            .exec()
            .then((articuloActualizado) => {
                if (!articuloActualizado) {
                    return res.status(500).json({
                        status: "error",
                        mensaje: "Error al actualizar",
                    });
                }
                return res.status(200).json({
                    status: "success",
                    articulo: articuloActualizado,
                    fichero: req.file
                });
            })

    }
}

const imagen = (req, res) => {
    let fichero = req.params.fichero;
    let ruta_fisica = "./imagenes/articulos/"+fichero;

    fs.stat(ruta_fisica, (error, existe) => {
        if(existe){
            return res.sendfile(path.resolve(ruta_fisica));
        }else{
            return res.status(404).json({
                status: "error",
                mensaje: "La imagen no existe",
            });
        }
    })
}


const buscador = async (req, res) => {
    try {
      // sacar el string de busqueda
      let busqueda = req.params.busqueda;
  
      // fin OR
      const articulosEncontrados = await Articulo.find({
        $or: [
          { titulo: { $regex: busqueda, $options: "i" } },
          { contenido: { $regex: busqueda, $options: "i" } },
        ],
      })
        .sort({ fecha: -1 });
  
      if (!articulosEncontrados.length) {
        return res.status(404).json({
          status: "error",
          mensaje: "No se han encontrado articulos",
        });
      }
  
      return res.status(200).json({
        status: "success",
        articulos: articulosEncontrados,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        mensaje: "Ha ocurrido un error en el servidor",
      });
    }
  };



module.exports = {
    prueba,
    curso,
    crear,
    listar,
    uno,
    borrar,
    editar,
    subir,
    imagen,
    buscador,
}
