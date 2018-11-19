'use strict'
var nodemailer = require('nodemailer');
var admin = require("firebase-admin");
var db = admin.database();

module.exports = {
      /*
      ENDPOINT de ACCESO: GET::api/profesores/
      RESULT: Array de JSON
      DESCRIPCION: Crea una lista de docentes de la escuela logeada
      */
      getDocentes : function(req, res){
            db.ref(`docentes`).once("value",
            (result)=>{
                  let docentes = result.val();
                  res.json({
                        message: "Lista de docentes extraida correctamente",
                        data : docentes,
                        path: "/teachers"
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
      ENDPOINT de ACCESO: POST::api/docentes {body lleva la info actualizada del usuario} 
      RESULT: Array de JSON 
      DESCRIPCION: Modificar un docente de la escuela logeada
      */
      updateDocente : function(req, res){
            var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                        user: 'keslerth.c2@gmail.com',
                        pass: 'prueba123A'            
                     }
                 });
            db.ref(`docentes`).once("value",
            (result)=>{
                  
                  var message;
                  var update = false;
                  var docentes = result.val();
                  for (const docente in docentes) {
                        if(docentes[docente].id == req.body.id){
                              if(docentes[docente].escuelas != undefined){
                                    for(const escuela in docentes[docente].escuelas){
                                          if(docentes[docente].escuelas[escuela].id != req.body.escuela.id){
                                                docentes[docente].escuelas.push(req.body.escuela);
                                                update = true;
                                                message = {
                                                      from: 'Extra Class <escuela@class.com>',
                                                      to: docentes[docente].correo,
                                                      subject: 'Invitación a ser parte de una escuela',
                                                      text: 'Si quieres pertenecer a esta escuela preciona el siguiente link',
                                                      html: `<a href="http://localhost:3000/api/profesores/${docentes[docente].id}/${req.body.escuela}"></a>`
                                                };
                                          }
                                    }
                              }else{
                                    docentes[docente].escuelas = [req.body.escuela];
                                    update = true;
                                    message = {
                                          from: 'Extra Class <escuela@class.com>',
                                          to: docentes[docente].correo,
                                          subject: 'Invitación a ser parte de una escuela',
                                          html: `<p><a href="http://localhost:3000/api/profesores/${docentes[docente].id}/${req.body.escuela.id}">Click Aquí</a> para pertenecer a la escuela</p>`
                                    };
                              }
                              
                        }
                  }
                  if(!update){
                        res.json({
                              message: "El docentes no existe en esta escuela",
                              data : req.body.data,
                              path: "/validate"
                        });
                  }else{
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
                                          message: "docente actualizado correctamente",
                                          data : docentes,
                                          path: "/teachers"
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
      },
      /*
      ENDPOINT de ACCESO: DELETE::api/docentes/:id/:idEscuela
      RESULT: Array de JSON 
      DESCRIPCION: Eliminar un docente de la escuela
      */
      deleteDocente : function(req, res){
            db.ref(`docentes`).once("value",
            (result)=>{
                  var remove = false;
                  var docentes = result.val();
                  for (const docente in docentes) {
                        if(docentes[docente].id == req.params.id){
                              for(const escuela in docentes[docente].escuelas){
                                    if(docentes[docente].escuelas[escuela].id == req.params.idEscuela){
                                          docentes[docente].escuelas.splice(escuela, 1);
                                          remove = true;
                                    }
                              }
                              
                        }
                  }
                  if(!remove){
                        res.json({
                              message: "El docente no existe en esta escuela",
                              data : req.body.data,
                              path: "/validate"
                        });
                  }else{
                        db.ref(`docentes`).set(docentes, (error)=>{
                              if(error){
                                    res.json({
                                          message: `Error: firebase.database.set > docentes`,
                                          data : error,
                                          path: "/error"
                                    });
                              }else{
                                    res.json({
                                          message: "docente eliminado correctamente",
                                          data : docentes,
                                          path: "/teachers"
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
      },
      /*
      ENDPOINT de ACCESO: GET::api/docentes/:idProfesor/:idEscuela 
      RESULT: Array de JSON 
      DESCRIPCION: Aceptar la invitacion por lo que vuelve el atributo solicitud true
      */
      acceptInvitation : function(req, res){
            db.ref(`docentes/${req.params.idProfesor}`).child(`escuelas/${req.params.idEscuela}`).child(`solicitud`).set(true,
                  (error)=>{
                        if(error){
                              res.json({
                                    message: `Error: firebase.database.set > invitación`,
                                    data : error,
                                    path: "/error"
                              });
                        }else{
                              res.json({
                                    message: "Invitación aceptada",
                                    data : undefined,
                                    path: "/teachers"
                              });
                        }
            });
      }
}