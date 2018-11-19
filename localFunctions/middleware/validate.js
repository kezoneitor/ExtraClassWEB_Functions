'use strict'

//Todo tipo de validación que se quiera hacer
module.exports = {
      validarID : function(req, res, next){
            var id = req.params.id;
            if(!isNaN(id)){
                  next();
            }else{
                  res.json({
                        message: "El valor enviado no es un número",
                        data : req.body.data,
                        path: "/validate"
                  });
            }
      }
}