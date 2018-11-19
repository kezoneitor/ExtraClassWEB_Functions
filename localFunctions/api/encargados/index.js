'use strict'
var express = require("express");
var controller = require("./encargados.controller");

var router = express.Router();

router.get("/", controller.getEncargados);

module.exports = router;
