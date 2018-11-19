'use strict'
var express = require("express");
var controller = require("./grupos.controller");
var validate = require("../../middleware/validate");

var router = express.Router();

router.get("/:id", controller.getGrupos);

router.post("/", controller.updateGrupo);

router.put("/", controller.newGrupo);

router.delete("/:id/:idGrupo", /*[validate.validarID],*/ controller.deleteGrupo); 
/*Si se necesitan hacer más funciones para validar los datos se realiza lo siguiente:
      Se crea una lista y se meten las funciones [ validate.fun1, validate.fun2, ... ]
*/

module.exports = router;
