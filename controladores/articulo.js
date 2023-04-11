const validator = require("validator");
const Articulo = require("../modelos/Articulo");
const { arabicLocales } = require("validator/lib/alpha");

const prueba = (req, res) => {
    return res.status(200).json({
        mensaje: "Soy una accion de prueba en mi controlador de articulos"
    });
}

const curso = (req, res)=> {

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
    try{

        let validar_titulo = !validator.isEmpty(parametros.titulo) &&
                            validator.isLength(parametros.titulo, {min: 5, max: undefined});
        let validar_contenido = !validator.isEmpty(parametros.contenido);

        if(!validar_titulo || !validar_contenido){
            throw new Error ("No se ha validado la informacion");
        }

    }catch(error){
        return res.status(400).json({
            status: "error",
            mensaje: "Faltan datos por enviar"
        });
    }

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

    if (req.params.ultimos){
        consulta.limit(2);
    }
    
    
    
    consulta.sort({fecha: -1})
            .then((articulos) => {

        if(!articulos || articulos.length === 0){
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

    let articulo_id = req. params.id;
    



    Articulo.findOneAndDelete({_id: articulo_id})
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
module.exports = {
    prueba,
    curso,
    crear,
    listar,
    uno,
    borrar,
}
