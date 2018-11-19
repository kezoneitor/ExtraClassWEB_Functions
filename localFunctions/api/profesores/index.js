'use strict'
var express = require("express");
var controller = require("./profesores.controller");
var validate = require("../../middleware/validate");

var router = express.Router();

router.get("/", controller.getDocentes);

router.get("/:idProfesor/:idEscuela", controller.acceptInvitation);

router.post("/", controller.updateDocente);

//router.put("/", controller.newDocente);

router.delete("/:id/:idEscuela", /*[validate.validarID],*/ controller.deleteDocente); 
/*Si se necesitan hacer más funciones para validar los datos se realiza lo siguiente:
      Se crea una lista y se meten las funciones [ validate.fun1, validate.fun2, ... ]
*/

module.exports = router;
