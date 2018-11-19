'use strict'
var nodemailer = require('nodemailer');
var admin = require("firebase-admin");
var db = admin.database();

module.exports = {
      getCuentas: function(req, res){
            var accountsT = [];
            var accountsA = [];
            db.ref(`docentes`).once("value",
            (result)=>{
                  for (const teacher of result.val()){
                        accountsT.push({id: teacher.id, correo: teacher.correo});
                  }
                  db.ref(`encargados`).once("value", 
                  (result2) => {
                        for (const attendant of result2.val()){
                              accountsA.push({id: attendant.id, correo: attendant.correo});
                        }
                        res.json({
                              message: `Cargados exitosamente`,
                              data : {t: accountsT, a: accountsA},
                              path: "/accounts"
                        });
                  }, 
                  (error)=>{
                        res.json({
                              message: `Error: firebase.database.once > encargados`,
                              data : error,
                              path: "/error"
                        });
                  });
            },
            (error)=>{
                  res.json({
                        message: `Error: firebase.database.once > docentes`,
                        data : error,
                        path: "/error"
                  });
            });
      }, 
      /*
      ENDPOINT de ACCESO: PUT::api/cuentas {body lleva la info para crear el usuario} 
      RESULT: Array de JSON 
      DESCRIPCION: Modificar un docente de la escuela logeada
      */
      putCuenta : function(req, res){
            var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                        user: 'keslerth.c2@gmail.com',
                        pass: 'prueba123A'            
                     }
                 });
            if (req.body.tipo == 'teacher') {
                  db.ref(`docentes`).once("value",
                  (result)=>{
                        var message;
                        var docentes = result.val();
                        docentes.push({
                              nombre: req.body.cuenta.nombre,
                              contrasena: req.body.cuenta.contrasena,
                              id: req.body.cuenta.id,
                              correo: req.body.cuenta.correo
                        });
                        message = {
                              from: 'Extra Class <escuela@class.com>',
                              to: req.body.cuenta.correo,
                              subject: 'Cuenta para participar de la escuela como profesor',
                              html: `<h3>Cuenta</h3>
                                     <h5>Pagina Extra class -> <a href="https://extraclass-3dd39.firebaseio.com">'https://extraclass-3dd39.firebaseio.com'</a><h/5>
                                     <p><strong>Nombre:</strong>${req.body.cuenta.nombre}</p>
                                     <p><strong>Correo:</strong>${req.body.cuenta.correo}</p>
                                     <p><strong>PIN:</strong>${req.body.cuenta.contrasena}</p>`
                        };
                        transporter.sendMail(message, function (err, info) {
                              if(err)
                              console.log(err);
                              else
                              console.log("Mail Send >>",info);
                        });
                        db.ref(`docentes`).set(docentes, (error)=>{
                              if(error){
                                    res.json({
                                          message: `Error: firebase.database.set > docentes`,
                                          data : error,
                                          path: "/error"
                                    });
                              }else{
                                    res.json({
                                          message: "Cuenta creada correctamente",
                                          data : 'Nada',
                                          path: "/accounts"
                                    });
                              }
                        });
                  },
                  (error)=>{
                        res.json({
                              message: `Error: firebase.database.once > docentes`,
                              data : error,
                              path: "/error"
                        });
                  });
            } else {
                  db.ref(`encargados`).once("value",
                  (result)=>{
                        var message;
                        var attendant = result.val();
                        attendant.push({
                              nombre: req.body.cuenta.nombre,
                              contrasena: req.body.cuenta.contrasena,
                              id: req.body.cuenta.id,
                              correo: req.body.cuenta.correo
                        });
                        message = {
                              from: 'Extra Class <escuela@class.com>',
                              to: req.body.cuenta.correo,
                              subject: 'Cuenta para participar de la escuela como encargado',
                              html: `<h3>Cuenta</h3>
                                     <h5>Pagina Extra class -> <a href="https://extraclass-3dd39.firebaseio.com">'https://extraclass-3dd39.firebaseio.com'</a><h/5>
                                     <p><strong>Nombre:</strong>${req.body.cuenta.nombre}</p>
                                     <p><strong>Correo:</strong>${req.body.cuenta.correo}</p>
                                     <p><strong>PIN:</strong>${req.body.cuenta.contrasena}</p>`
                        };
                        transporter.sendMail(message, function (err, info) {
                              if(err)
                              console.log(err);
                              else
                              console.log("Mail Send >>",info);
                        });
                        db.ref(`encargados`).set(attendant, (error)=>{
                              if(error){
                                    res.json({
                                          message: `Error: firebase.database.set > encargados`,
                                          data : error,
                                          path: "/error"
                                    });
                              }else{
                                    res.json({
                                          message: "Cuenta creada correctamente",
                                          data : 'Nada',
                                          path: "/accounts"
                                    });
                              }
                        });
                  },
                  (error)=>{
                        res.json({
                              message: `Error: firebase.database.once > docentes`,
                              data : error,
                              path: "/error"
                        });
                  });
            }
      },
      /*
      ENDPOINT de ACCESO: POST::api/cuentas {body lleva la info actualizada del usuario} 
      RESULT: Array de JSON 
      DESCRIPCION: Modificar un docente de la escuela logeada
      */
      updateCuenta : function(req, res){
            var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                        user: 'keslerth.c2@gmail.com',
                        pass: 'prueba123A'            
                     }
                 });
            if (req.body.tipo == 'teacher') {
                  db.ref(`docentes`).once("value",
                  (result)=>{
                        var message;
                        var docentes = result.val();
                        var update = false;
                        for (const i in docentes){
                              if(docentes[i].id == req.body.cuenta.id){
                                    if(docentes[i].correo == req.body.cuenta.correoV &&
                                          docentes[i].contrasena == req.body.cuenta.contrasenaV){       
                                                docentes[i].nombre = req.body.cuenta.nombre;
                                                docentes[i].contrasena = req.body.cuenta.contrasena;
                                                docentes[i].correo = req.body.cuenta.correo;
                                                update = true;
                                    }
                              }
                        }
                        if(!update){
                              res.json({
                                    message: "Tu contraseña o correo son incorrectos. intenta de nuevo",
                                    update : update,
                                    path: "/validate"
                              });
                        }else{
                              message = {
                                    from: 'Extra Class <escuela@class.com>',
                                    to: req.body.cuenta.correo,
                                    subject: 'Se a actualizado tu cuenta como profesor',
                                    html: `<h3>Cuenta</h3>
                                           <h5>Pagina Extra class -> <a href="https://extraclass-3dd39.firebaseio.com">'https://extraclass-3dd39.firebaseio.com'</a><h/5>
                                           <p><strong>Nombre:</strong>${req.body.cuenta.nombre}</p>
                                           <p><strong>Correo:</strong>${req.body.cuenta.correo}</p>
                                           <p><strong>PIN:</strong>${req.body.cuenta.contrasena}</p>`
                              };
                              transporter.sendMail(message, function (err, info) {
                                    if(err)
                                    console.log(err);
                                    else
                                    console.log("Mail Send >>",info);
                              });
                              db.ref(`docentes`).set(docentes, (error)=>{
                                    if(error){
                                          res.json({
                                                message: `Error: firebase.database.set > docentes`,
                                                data : error,
                                                path: "/error"
                                          });
                                    }else{
                                          res.json({
                                                message: "Cuenta modificada correctamente",
                                                update : update,
                                                path: "/accounts"
                                          });
                                    }
                              });
                        }
                  },
                  (error)=>{
                        res.json({
                              message: `Error: firebase.database.once > docentes`,
                              data : error,
                              path: "/error"
                        });
                  });
            } else {
                  db.ref(`encargados`).once("value",
                  (result)=>{
                        var message;
                        var attendant = result.val();
                        var update = false;
                        for (const i in attendant){
                              if(attendant[i].id == req.body.cuenta.id){
                                    if(attendant[i].correo == req.body.cuenta.correoV &&
                                       attendant[i].contrasena == req.body.cuenta.contrasenaV){       
                                          attendant[i].nombre = req.body.cuenta.nombre;
                                          attendant[i].contrasena = req.body.cuenta.contrasena;
                                          attendant[i].correo = req.body.cuenta.correo;
                                          update = true;
                                    }
                              }
                        }
                        if(!update){
                              res.json({
                                    message: "Tu contraseña o correo son incorrectos. intenta de nuevo",
                                    update : update,
                                    path: "/validate"
                              });
                        }else{
                              message = {
                                    from: 'Extra Class <escuela@class.com>',
                                    to: req.body.cuenta.correo,
                                    subject: 'Se a actualizado tu cuenta como encargado',
                                    html: `<h3>Cuenta</h3>
                                           <h5>Pagina Extra class -> <a href="https://extraclass-3dd39.firebaseio.com">'https://extraclass-3dd39.firebaseio.com'</a><h/5>
                                           <p><strong>Nombre:</strong>${req.body.cuenta.nombre}</p>
                                           <p><strong>Correo:</strong>${req.body.cuenta.correo}</p>
                                           <p><strong>PIN:</strong>${req.body.cuenta.contrasena}</p>`
                              };
                              transporter.sendMail(message, function (err, info) {
                                    if(err)
                                    console.log(err);
                                    else
                                    console.log("Mail Send >>",info);
                              });
                              db.ref(`encargados`).set(attendant, (error)=>{
                                    if(error){
                                          res.json({
                                                message: `Error: firebase.database.set > docentes`,
                                                data : error,
                                                path: "/error"
                                          });
                                    }else{
                                          res.json({
                                                message: "Cuenta modificada correctamente",
                                                update : update,
                                                path: "/accounts"
                                          });
                                    }
                              });
                        }
                  },
                  (error)=>{
                        res.json({
                              message: `Error: firebase.database.once > docentes`,
                              data : error,
                              path: "/error"
                        });
                  });
            }
      },
      /*
      ENDPOINT de ACCESO: DELETE::api/cuentas/:id/:correo/:contrasena/:tipo
      RESULT: Array de JSON 
      DESCRIPCION: Eliminar un docente de la escuela
      */
      deleteCuenta : function(req, res){
            console.log(req.params);
            var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                        user: 'keslerth.c2@gmail.com',
                        pass: 'prueba123A'            
                     }
                 });
            if (req.params.tipo == 'teacher') {
                  db.ref('docentes').once("value",
                  (result)=>{
                        var message;
                        var docentes = result.val();
                        var remove = 0;
                        for (const i in docentes){
                              if(docentes[i].id == req.params.id){
                                    if(docentes[i].correo == req.params.correo &&
                                          docentes[i].contrasena == req.params.contrasena){       
                                                if(docentes[i].escuelas == undefined) {
                                                      docentes.splice(i, 1);
                                                      remove = 2;
                                                } else {
                                                      remove = 1;
                                                }
                                    }
                              }
                        }
                        if(remove == 0){
                              res.json({
                                    message: "Tu contraseña o correo son incorrectos. intenta de nuevo",
                                    remove : false,
                                    path: "/validate"
                              });
                        } else if (remove == 1) {
                              res.json({
                                    message: "Para eliminar esta cuenta debe eliminarlo de todas las escuelas",
                                    remove : false,
                                    path: "/validate"
                              });
                        }
                        else{
                              message = {
                                    from: 'Extra Class <escuela@class.com>',
                                    to: req.params.correo,
                                    subject: 'Su cuenta a sido eliminada',
                                    html: `<h3>Mensaje</h3>
                                           <h5>Pagina Extra class -> <a href="https://extraclass-3dd39.firebaseio.com">'https://extraclass-3dd39.firebaseio.com'</a><h/5>
                                           <p>Lamentamos que esto allá ocurrido pero su cuenta a sido eliminada</p>`
                              };
                              transporter.sendMail(message, function (err, info) {
                                    if(err)
                                    console.log(err);
                                    else
                                    console.log("Mail Send >>",info);
                              });
                              db.ref(`docentes`).set(docentes, (error)=>{
                                    if(error){
                                          res.json({
                                                message: `Error: firebase.database.set > docentes`,
                                                data : error,
                                                path: "/error"
                                          });
                                    }else{
                                          res.json({
                                                message: "Cuenta eliminada correctamente",
                                                remove : true,
                                                path: "/accounts"
                                          });
                                    }
                              });
                        }
                  },
                  (error)=>{
                        res.json({
                              message: `Error: firebase.database.once > docentes`,
                              data : error,
                              path: "/error"
                        });
                  });
            } else {
                  db.ref(`encargados`).once("value",
                  (result)=>{
                        var message;
                        var attendant = result.val();
                        var remove = 0;
                        for (const i in docentes){
                              if(attendant[i].id == req.params.id){
                                    if(attendant[i].correo == req.params.correo &&
                                          attendant[i].contrasena == req.params.contrasena){       
                                                if(attendant[i].escuelas == undefined) {
                                                      attendant.splice(i, 1);
                                                      remove = 2;
                                                } else {
                                                      remove = 1;
                                                }
                                    }
                              }
                        }
                        if(remove == 0){
                              res.json({
                                    message: "Tu contraseña o correo son incorrectos. intenta de nuevo",
                                    remove : false,
                                    path: "/validate"
                              });
                        } else if (remove == 1) {
                              res.json({
                                    message: "Para eliminar esta cuenta debe sacar al estudiante de todos los grupos",
                                    remove : false,
                                    path: "/validate"
                              });
                        }
                        else{
                              message = {
                                    from: 'Extra Class <escuela@class.com>',
                                    to: req.params.correo,
                                    subject: 'Su cuenta a sido eliminada',
                                    html: `<h3>Mensaje</h3>
                                           <h5>Pagina Extra class -> <a href="https://extraclass-3dd39.firebaseio.com">'https://extraclass-3dd39.firebaseio.com'</a><h/5>
                                           <p>Lamentamos que esto allá ocurrido pero su cuenta a sido eliminada</p>`
                              };
                              transporter.sendMail(message, function (err, info) {
                                    if(err)
                                    console.log(err);
                                    else
                                    console.log("Mail Send >>",info);
                              });
                              db.ref(`encargados`).set(attendant, (error)=>{
                                    if(error){
                                          res.json({
                                                message: `Error: firebase.database.set > docentes`,
                                                data : error,
                                                path: "/error"
                                          });
                                    }else{
                                          res.json({
                                                message: "Cuenta modificada correctamente",
                                                update : update,
                                                path: "/accounts"
                                          });
                                    }
                              });
                        }
                  },
                  (error)=>{
                        res.json({
                              message: `Error: firebase.database.once > docentes`,
                              data : error,
                              path: "/error"
                        });
                  });
            }
      }
}