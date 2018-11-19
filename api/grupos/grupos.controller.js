'use strict'
var admin = require("firebase-admin");
var db = admin.database();

//Eliminar elementos del arr1 que se encuentren en el arr2
function arrayRemove(arr1, arr2) {
      return arr1.filter(ele1 => {
            return ele1 != arr2.filter(ele2 => {
            return ele2 == ele1;
            });
      });
}
//Crear una lista con los ids del arr enviado
function arrayIDs(arr){
      var ids = [];
      if(arr != undefined){
            arr.forEach(ele =>{
                  ids.push(ele.id);
            });   
      }
      return ids;
}

//Elimina el grupo al docente reemplazado
function deleteDocente(ids, grupo, docentes, docente){
      if(docentes[docente].id == ids.docente){//buscar docente
            for(const escuela in docentes[docente].escuelas){
                  if(docentes[docente].escuelas[escuela].id == ids.escuela){//buscar escuela del docente
                        for (const grupoDoc in docentes[docente].escuelas[escuela].grupos) {
                              if(docentes[docente].escuelas[escuela].grupos[grupoDoc].id == grupo.id){// buscar grupo de la escuela donde esta el docente
                                    docentes[docente].escuelas[escuela].grupos.splice(grupoDoc, 1);
                              }
                        }
                  }
            }
      }
      return docentes;
}
//Crea grupo al doncente nuevo
function createDocente(ids, grupo, docentes, docente){
      if(docentes[docente].id == grupo.idDocente){//buscar docente
            if(docentes[docente].escuelas != undefined){//Si no tiene ninguna escuela agregada
                  for(const escuela in docentes[docente].escuelas){
                        if(docentes[docente].escuelas[escuela].id == ids.escuela){//buscar escuela del docente
                              if(docentes[docente].escuelas[escuela].grupos != undefined){//Si no tiene ningun grupo asignado
                                    docentes[docente].escuelas[escuela].grupos.push({id: grupo.id});
                              }else{
                                    docentes[docente].escuelas[escuela].grupos = [{id: grupo.id}];
                              }
                        }
                  }
            }else{
                  docentes[docente].escuelas = [{id: ids.escuela, grupos: [{id: grupo.id}]}];
            }
      }
      return docentes;
}
//Elimina el grupo al encargado del estudiante
function deleteEncargado(ids, grupo, encargados, encargado, encaViejos){
      for(const enca in encaViejos){
            if(encargados[encargado].id == encaViejos[enca]){
                  for(const grupoEnc in encargados[encargado].grupos){
                        if(encargados[encargado].grupos[grupoEnc].idGrupo == grupo.id){
                              if(encargados[encargado].grupos[grupoEnc].estudiantes.length <= 1){
                                    encargados[encargado].grupos.splice(grupoEnc, 1);
                              }
                              else{
                                    for(const estu in encargados[encargado].grupos[grupoEnc].estudiantes){
                                          if(encargados[encargado].grupos[grupoEnc].estudiantes[estu].id == ids.estuViejos[enca]){
                                                encargados[encargado].grupos[grupoEnc].estudiantes.splice(estu, 1);  
                                          }
                                    }
                              }
                        }
                  }
            }
      }
      return encargados;
}
//Crea grupo al encargado del estudiante
function createEncargado(ids, grupo, encargados, encargado, encaNuevos){
      for(const enca in encaNuevos){
            if(encargados[encargado].id == encaNuevos[enca]){
                  if(encargados[encargado].grupos != undefined){
                        var existe = false;
                        for(const grupoEnc in encargados[encargado].grupos){
                              if(encargados[encargado].grupos[grupoEnc].idGrupo == grupo.id){
                                    encargados[encargado].grupos[grupoEnc].estudiantes.push({id: ids.estuNuevos[enca]});
                                    existe = true;
                              }
                        }
                        if(!existe){
                              encargados[encargado].grupos.push({
                                    idEscuela: ids.escuela,
                                    idGrupo: grupo.id,
                                    estudiantes: [{id: ids.estuNuevos[enca]}]
                              });
                        }
                  }
                  else{
                        encargados[encargado].grupos = [{
                              idEscuela: ids.escuela,
                              idGrupo: grupo.id,
                              estudiantes: [{id: ids.estuNuevos[enca]}]
                        }];
                  }
            }
      }
      return encargados;
}
//Actualizar un arr de firebase con el nombre name{puede ser cualquier string}
function firedbChange(arr, name){
      db.ref(name).set(arr, (error) => {
            if(error){
                  res.json({
                        message: `Error: firebase.database.set > ${name}`,
                        data : error,
                        path: "/error"
                  });
            }
      });
}

/*
Llamada del metodo: en Endponit updateGrupo.

Descripcion: Esta funcion crea un grupo en el nuevo docente del grupo y elimina el grupo del docente antiguo, 
también agrega y elimina los grupos de los encargados, es decir, si el estudiante ya no esta en ese grupo
lo elimina o agrega el estudiante si no esta en el grupo.
*/
function updateDE(ids, grupo){
      if(ids.docente != grupo.idDocente){
            db.ref("docentes").once("value", 
            result => {
                  var docentes = result.val();
                  for (const docente in docentes) {
                        //Eliminar grupo al docente que reemplazaron
                        docentes = deleteDocente(ids, grupo, docentes, docente);
                        //Agregar grupo al docente nuevo
                        docentes = createDocente(ids, grupo, docentes, docente);
                  }
                  firedbChange(docentes, "docentes");
            });
      }
      db.ref(`escuelas/${ids.escuela}/estudiantes`).once("value", 
            result => {
                  var estudiantes = result.val();
                  var encaViejos = [];
                  var encaNuevos = [];
                  estudiantes.forEach(estudiante => {
                        for(const ii in ids.estuViejos){
                              if(ids.estuViejos[ii] == estudiante.id){
                                    encaViejos.push(estudiante.idEncargado);
                              }
                        }
                        for(const ii in ids.estuNuevos){
                              if(ids.estuNuevos[ii] == estudiante.id){
                                    encaNuevos.push(estudiante.idEncargado);
                              }
                        }
                  });
                  if(encaNuevos != [] || encaViejos != []){
                        db.ref("encargados").once("value",
                        result => {
                              var encargados = result.val();
                              for(const encargado in encargados){
                                    //Eliminar grupo al encargado que reemplazaron
                                    encargados = deleteEncargado(ids, grupo, encargados, encargado, encaViejos);
                                    //Agregar grupo al encargado nuevo
                                    encargados = createEncargado(ids, grupo, encargados, encargado, encaNuevos);
                              }
                              firedbChange(encargados, "encargados");
                        });
                  }
            });
}

/*
Llamada del metodo: en Endponit newGrupo.

Descripcion: Esta funcion crea un grupo en el nuevo docente del grupo y 
también agrega los grupos de los encargados, es decir, agrega el estudiante si no esta en el grupo.
*/
function createDE(ids, grupo){
      db.ref("docentes").once("value", 
      result => {
            var docentes = result.val();
            for (const docente in docentes) {
                  //Agregar grupo al docente nuevo
                  docentes = createDocente(ids, grupo, docentes, docente);
            }
            firedbChange(docentes, "docentes");
      });
      db.ref(`escuelas/${ids.escuela}/estudiantes`).once("value", 
            result => {
                  var estudiantes = result.val();
                  var encaNuevos = [];
                  estudiantes.forEach(estudiante => {
                        for(const ii in ids.estuNuevos){
                              if(ids.estuNuevos[ii] == estudiante.id){
                                    encaNuevos.push(estudiante.idEncargado);
                              }
                        }
                  });
                  if(encaNuevos != []){
                        db.ref("encargados").once("value",
                        result => {
                              var encargados = result.val();
                              for(const encargado in encargados){
                                    encargados = createEncargado(ids, grupo, encargados, encargado, encaNuevos);
                              }
                              firedbChange(encargados, "encargados");
                        });
                  }
            });
}

function deleteDE(ids, grupo){
      db.ref("docentes").once("value", 
      result => {
            var docentes = result.val();
            for (const docente in docentes) {
                  //Agregar grupo al docente nuevo
                  docentes = deleteDocente(ids, grupo, docentes, docente);
            }
            firedbChange(docentes, "docentes");
      });
      db.ref(`escuelas/${ids.escuela}/estudiantes`).once("value", 
            result => {
                  var estudiantes = result.val();
                  var encaViejos = [];
                  estudiantes.forEach(estudiante => {
                        for(const ii in ids.estuViejos){
                              if(ids.estuViejos[ii] == estudiante.id){
                                    encaViejos.push(estudiante.idEncargado);
                              }
                        }
                  });
                  if(encaViejos != []){
                        db.ref("encargados").once("value",
                        result => {
                              var encargados = result.val();
                              for(const encargado in encargados){
                                    encargados = deleteEncargado(ids, grupo, encargados, encargado, encaViejos);
                              }
                              firedbChange(encargados, "encargados");
                        });
                  }
            });
}


module.exports = {
      /*
      ENDPOINT de ACCESO: GET::api/grupos/:id{referencia al id de la escuela en firebase} 
      RESULT: Array de JSON
      DESCRIPCION: Crea una lista de grupos de la escuela logeada
      */
      getGrupos : function(req, res){
            db.ref(`escuelas/${req.params.id}/grupos`).once("value",
            (result)=>{
                  let grupos = result.val();
                  res.json({
                        message: "Lista de grupos extraida correctamente",
                        data : grupos,
                        path: "/groups"
                  });
            },
            (error)=>{
                  res.json({
                        message: `Error: firebase.database.once > escuelas/${req.params.id}/grupos`,
                        data : error,
                        path: "/error"
                  });
            });
      },
      /*
      ENDPOINT de ACCESO: POST::api/grupos {body lleva la info actualizada del usuario} 
      RESULT: Array de JSON 
      DESCRIPCION: Modificar un grupo de la escuela logeada
      */
      updateGrupo : function(req, res){
            db.ref(`escuelas/${req.body.id}/grupos`).once("value",
            (result)=>{
                  var update = false;
                  var ids = {estuViejos: [], estuNuevos: [], docente: "", escuela: req.body.id};
                  var grupos = result.val();
                  for (const grupo in grupos) {
                        if(grupos[grupo].id == req.body.data.id){
                              var arrViejos = arrayIDs(grupos[grupo].estudiantes);
                              var arrNuevos = arrayIDs(req.body.data.estudiantes);
                              ids.estuViejos = arrayRemove(arrViejos, arrNuevos);
                              ids.estuNuevos =  arrayRemove(arrNuevos, arrViejos);
                              ids.docente = grupos[grupo].idDocente;
                              grupos[grupo] = req.body.data;
                              updateDE(ids, grupos[grupo]);
                              update = true;
                        }
                  }
                  if(!update){
                        res.json({
                              message: "El grupo no existe en esta escuela",
                              data : req.body.data,
                              path: "/validate"
                        });
                  }else{
                        db.ref(`escuelas/${req.body.id}/grupos`).set(grupos, (error)=>{
                              if(error){
                                    res.json({
                                          message: `Error: firebase.database.set > escuelas/${req.body.id}/grupos`,
                                          data : error,
                                          path: "/error"
                                    });
                              }else{
                                    
                                    res.json({
                                          message: "grupo actualizado correctamente",
                                          data : grupos,
                                          path: "/groups"
                                    });
                              }
                        });
                  }
            },
            (error)=>{
                  res.json({
                        message: `Error: firebase.database.once > escuelas/${req.body.id}/grupos`,
                        data : error,
                        path: "/error"
                  });
            });
      },
      /*
      ENDPOINT de ACCESO: PUT::api/grupos {body lleva la info nueva del usuario} 
      RESULT: Array de JSON 
      DESCRIPCION: Crear un grupo en la escuela logeada
      */
      newGrupo : function(req, res){
            db.ref(`escuelas/${req.body.id}/grupos`).once("value",
            (result)=>{
                  var add = true;
                  var grupos = result.val();
                  var ids = {estuNuevos: [], docente: "", escuela: req.body.id};
                  for (const grupo in grupos) {
                        if(grupos[grupo].id == req.body.data.id){
                              add = false;
                        }
                  }
                  if(!add){
                        res.json({
                              message: "El grupo existe en esta escuela",
                              data : req.body.data,
                              path: "/validate"
                        });
                  }else{
                        ids.estuNuevos = arrayIDs(req.body.data.estudiantes);
                        ids.docente = req.body.data.idDocente;
                        createDE(ids, req.body.data);
                        grupos.push(req.body.data);
                        db.ref(`escuelas/${req.body.id}/grupos`).set(grupos, (error)=>{
                              if(error){
                                    res.json({
                                          message: `Error: firebase.database.set > escuelas/${req.body.id}/grupos`,
                                          data : error,
                                          path: "/error"
                                    });
                              }else{
                                    res.json({
                                          message: "grupo fue agregado correctamente",
                                          data : grupos,
                                          path: "/groups"
                                    });
                              }
                        });
                  }
            },
            (error)=>{
                  res.json({
                        message: `Error: firebase.database.once > escuelas/${req.body.id}/grupos`,
                        data : error,
                        path: "/error"
                  });
            });
      },
      /*
      ENDPOINT de ACCESO: DELETE::api/grupos/:id/:idGrupo {id => escuela, idgrupo => id del grupo} 
      RESULT: Array de JSON
      DESCRIPCION: Eliminar un grupo de la escuela logeada
      */
      deleteGrupo : function(req, res){
            db.ref(`escuelas/${req.params.id}/grupos`).once("value",
            (result)=>{
                  var remove = false;
                  var ids = {estuViejos: [], docente: "", escuela: req.params.id};
                  var grupos = result.val();
                  for (const grupo in grupos) {
                        if(grupos[grupo].id == req.params.idGrupo){
                              ids.estuViejos = arrayIDs(grupos[grupo].estudiantes);
                              ids.docente = grupos[grupo].idDocente;
                              deleteDE(ids, grupos[grupo]);
                              grupos.splice(grupo, 1);
                              remove = true;
                        }
                  }
                  if(!remove){
                        res.json({
                              message: "El grupo no existe en esta escuela",
                              data : req.body.data,
                              path: "/validate"
                        });
                  }else{
                        db.ref(`escuelas/${req.params.id}/grupos`).set(grupos, (error)=>{
                              if(error){
                                    res.json({
                                          message: `Error: firebase.database.set > escuelas/${req.params.id}/grupos`,
                                          data : error,
                                          path: "/error"
                                    });
                              }else{
                                    res.json({
                                          message: "grupo eliminado correctamente",
                                          data : grupos,
                                          path: "/groups"
                                    });
                              }
                        });
                  }
            },
            (error)=>{
                  res.json({
                        message: `Error: firebase.database.once > escuelas/${req.params.id}/grupos`,
                        data : error,
                        path: "/error"
                  });
            });
      }
}