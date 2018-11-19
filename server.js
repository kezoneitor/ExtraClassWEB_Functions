'use strict'
var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var admin = require("firebase-admin");
var serviceAccount = require('./serviceAccountKey.json');

var app = express();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cors());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://extraclass-3dd39.firebaseio.com'
});

require("./routers")(app);

app.listen('https://extraclass-3dd39.herokuapp.com', () => {
  console.log('https://extraclass-3dd39.herokuapp.com/');
})