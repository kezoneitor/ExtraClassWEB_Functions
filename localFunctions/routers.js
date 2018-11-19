'use strict'

module.exports = function route(app){
      app.use("/api/estudiantes", require("./api/estudiantes"));
      app.use("/api/profesores", require("./api/profesores"));
      app.use("/api/grupos", require("./api/grupos"));
      app.use("/api/encargados", require("./api/encargados"));
      app.use("/api/login", require("./api/login"));
      app.use("/api/cuentas", require("./api/cuentas"));

};