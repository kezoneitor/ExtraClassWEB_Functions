'use strict'
var admin = require("firebase-admin");
var db = admin.database();

function deleteEs(idEstudiante, idEscuela){
      db.ref(`escuelas/${idEscuela}/grupos`).once("value",
      result => {
            var grupos = result.val();
            for(const grupo in grupos){
                  for(const estudiante in grupos[grupo].estudiantes){
                        if(grupos[grupo].estudiantes[estudiante].id == idEstudiante){
                              grupos[grupo].estudiantes.splice(estudiante, 1);
                        }
                  }
            }
            db.ref(`escuelas/${idEscuela}/grupos`).set(grupos, (error) => {
                  if(error){
                        res.json({
                              message: `Error: firebase.database.set > escuelas/${idEscuela}/grupos`,
                              data : error,
                              path: "/error"
                        });
                  }
            });
      });
      db.ref("encargados").once("value",
      result => {
            var encargados = result.val();
            for(const encargado in encargados){
                  for(const grupo in encargados[encargado].grupos){
                        for(const estudiante in encargados[encargado].grupos[grupo].estudiantes){
                              if(encargados[encargado].grupos[grupo].estudiantes[estudiante].id == idEstudiante){
                                    if(encargados[encargado].grupos[grupo].estudiantes.length <= 1){
                                          encargados[encargado].grupos.splice(grupo, 1);
                                    }
                                    else{
                                          encargados[encargado].grupos[grupo].estudiantes.splice(estudiante, 1);
                                    }
                              }
                        }
                  }
            }
            db.ref("encargados").set(encargados, (error) => {
                  if(error){
                        res.json({
                              message: `Error: firebase.database.set > encargados`,
                              data : error,
                              path: "/error"
                        });
                  }
            });
      });
      
}

module.exports = {
      /*
      ENDPOINT de ACCESO: GET::api/estudiantes/:id{referencia al id de la escuela en firebase} 
      RESULT: Array de JSON
      DESCRIPCION: Crea una lista de estudiantes de la escuela logeada
      */
      getEstudiantes : function(req, res){
            db.ref(`escuelas/${req.params.id}/estudiantes`).once("value",
            (result)=>{
                  let estudiantes = result.val();
                  res.json({
                        message: "Lista de estudiantes extraida correctamente",
                        data : estudiantes,
                        path: "/students"
                  });
            },
            (error)=>{
                  res.json({
                        message: `Error: firebase.database.once > escuelas/${req.params.id}/estudiantes`,
                        data : error,
                        path: "/error"
                  });
            });
      },
      /*
      ENDPOINT de ACCESO: POST::api/estudiantes {body lleva la info actualizada del usuario} 
      RESULT: Array de JSON 
      DESCRIPCION: Modificar un estudiante de la escuela logeada
      */
      updateEstudiante : function(req, res){
            db.ref(`escuelas/${req.body.id}/estudiantes`).once("value",
            (result)=>{
                  var update = false;
                  var estudiantes = result.val();
                  for (const estudiante in estudiantes) {
                        if(estudiantes[estudiante].id == req.body.data.id){
                              estudiantes[estudiante] = req.body.data;
                              update = true;
                        }
                  }
                  if(!update){
                        res.json({
                              message: "El estudiantes no existe en esta escuela",
                              data : req.body.data,
                              path: "/validate"
                        });
                  }else{
                        db.ref(`escuelas/${req.body.id}/estudiantes`).set(estudiantes, (error)=>{
                              if(error){
                                    res.json({
                                          message: `Error: firebase.database.set > escuelas/${req.body.id}/estudiantes`,
                                          data : error,
                                          path: "/error"
                                    });
                              }else{
                                    res.json({
                                          message: "Estudiantes actualizado correctamente",
                                          data : estudiantes,
                                          path: "/students"
                                    });
                              }
                        });
                  }
            },
            (error)=>{
                  res.json({
                        message: `Error: firebase.database.once > escuelas/${req.body.id}/estudiantes`,
                        data : error,
                        path: "/error"
                  });
            });
      },
      /*
      ENDPOINT de ACCESO: PUT::api/estudiantes {body lleva la info nueva del usuario} 
      RESULT: Array de JSON 
      DESCRIPCION: Crear un estudiante en la escuela logeada
      */
      newEstudiante : function(req, res){
            db.ref(`escuelas/${req.body.id}/estudiantes`).once("value",
            (result)=>{
                  var add = true;
                  var estudiantes = result.val();
                  for (const estudiante in estudiantes) {
                        if(estudiantes[estudiante].id == req.body.data.id){
                              add = false;
                        }
                  }
                  if(!add){
                        res.json({
                              message: "El estudiantes existe en esta escuela",
                              data : req.body.data,
                              path: "/validate"
                        });
                  }else{
                        estudiantes.push(req.body.data);
                        db.ref(`escuelas/${req.body.id}/estudiantes`).set(estudiantes, (error)=>{
                              if(error){
                                    res.json({
                                          message: `Error: firebase.database.set > escuelas/${req.body.id}/estudiantes`,
                                          data : error,
                                          path: "/error"
                                    });
                              }else{
                                    res.json({
                                          message: "Estudiante fue agregado correctamente",
                                          data : estudiantes,
                                          path: "/students"
                                    });
                              }
                        });
                  }
            },
            (error)=>{
                  res.json({
                        message: `Error: firebase.database.once > escuelas/${req.body.id}/estudiantes`,
                        data : error,
                        path: "/error"
                  });
            });
      },
      /*
      ENDPOINT de ACCESO: DELETE::api/estudiantes/:id/:idEstudiante {id => escuela, idEstudiante => id del estudiante} 
      RESULT: Array de JSON
      DESCRIPCION: Eliminar un estudiante de la escuela logeada
      */
      deleteEstudiante : function(req, res){
            db.ref(`escuelas/${req.params.id}/estudiantes`).once("value",
            (result)=>{
                  var remove = false;
                  var estudiantes = result.val();
                  for (const estudiante in estudiantes) {
                        if(estudiantes[estudiante].id == req.params.idEstudiante){
                              deleteEs(estudiantes[estudiante].id, req.params.id);
                              estudiantes.splice(estudiante, 1);
                              remove = true;
                        }
                  }
                  if(!remove){
                        res.json({
                              message: "El estudiantes no existe en esta escuela",
                              data : req.body.data,
                              path: "/validate"
                        });
                  }else{
                        db.ref(`escuelas/${req.params.id}/estudiantes`).set(estudiantes, (error)=>{
                              if(error){
                                    res.json({
                                          message: `Error: firebase.database.set > escuelas/${req.params.id}/estudiantes`,
                                          data : error,
                                          path: "/error"
                                    });
                              }else{
                                    res.json({
                                          message: "Estudiantes eliminado correctamente",
                                          data : estudiantes,
                                          path: "/students"
                                    });
                              }
                        });
                  }
            },
            (error)=>{
                  res.json({
                        message: `Error: firebase.database.once > escuelas/${req.params.id}/estudiantes`,
                        data : error,
                        path: "/error"
                  });
            });
      }
}