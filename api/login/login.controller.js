'use strict'
var admin = require("firebase-admin");
var db = admin.database();

module.exports = {
      /*
      ENDPOINT de ACCESO: POST::api/login/ {body lleva la contraseña y nombre usuario} 
      RESULT: Array de JSON 
      DESCRIPCION: Logearse a la página
      */
      LOG_IN : function(req, res){
            db.ref(`escuelas`).once("value",
            (result)=>{
                  for (const escuela of result.val()) {
                        if(escuela.correo == req.body.correo &&
                           escuela.contrasena == req.body.pass){
                              res.json({
                                    message: `Inicio de sesión exito!!!`,
                                    data : {log: true, nombre: escuela.nombre, id: escuela.id},
                                    path: "/students"
                              });
                              return;
                        } 
                  }
                  res.json({
                        message: `Inicio de sesión falló, por favor revise su correo y contraseña`,
                        data : {log: false},
                        path: ""
                  });
            },
            (error) => {
                  res.json({
                        message: `Error: firebase.database.set > docentes`,
                        data : error,
                        path: "/error"
                  });
            });
      }
}