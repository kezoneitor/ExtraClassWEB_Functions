'use strict'
var express = require("express");
var controller = require("./cuentas.controller");
var validate = require("../../middleware/validate");

var router = express.Router();

router.get("/", controller.getCuentas);

router.put("/", controller.putCuenta);

router.post("/", controller.updateCuenta);

//router.put("/", controller.newDocente);

router.delete("/:id/:correo/:contrasena/:tipo", /*[validate.validarID],*/ controller.deleteCuenta); 
/*Si se necesitan hacer más funciones para validar los datos se realiza lo siguiente:
      Se crea una lista y se meten las funciones [ validate.fun1, validate.fun2, ... ]
*/

module.exports = router;
