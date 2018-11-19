'use strict'
var admin = require("firebase-admin");
var db = admin.database();

module.exports = {
      /*
      ENDPOINT de ACCESO: GET::api/encargados/
      RESULT: Array de JSON
      DESCRIPCION: Crea una lista de estudiantes de la escuela logeada
      */
      getEncargados : function(req, res){
            db.ref(`encargados`).once("value",
            (result)=>{
                  let encargados = result.val();
                  res.json({
                        message: "Lista de encargados extraida correctamente",
                        data : encargados,
                        path: "/students"
                  });
            },
            (error)=>{
                  res.json({
                        message: `Error: firebase.database.once > encargados`,
                        data : error,
                        path: "/error"
                  });
            });
      }
}