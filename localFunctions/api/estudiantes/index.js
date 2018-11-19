'use strict'
var express = require("express");
var controller = require("./estudiantes.controller");
var validate = require("../../middleware/validate");

var router = express.Router();

router.get("/:id", controller.getEstudiantes);

router.post("/", controller.updateEstudiante);

router.put("/", controller.newEstudiante);

router.delete("/:id/:idEstudiante", /*[validate.validarID],*/ controller.deleteEstudiante); 
/*Si se necesitan hacer más funciones para validar los datos se realiza lo siguiente:
      Se crea una lista y se meten las funciones [ validate.fun1, validate.fun2, ... ]
*/

module.exports = router;
