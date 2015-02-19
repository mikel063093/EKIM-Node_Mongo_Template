// models/index.js
if (!global.hasOwnProperty('db')) {

  var mongoose = require('mongoose');

  var dbName = 'EKIM'

  // the application is executed on the local machine ...
  mongoose.connect('mongodb://localhost/' + dbName);


  global.db = {

    mongoose: mongoose,

    //models
    User:           require('./User')(mongoose),
    Img: require('./Img')(mongoose),

    // agregar más modelos aquí en caso de haberlos
  };
console.log("DB CRETAED");
}

module.exports = global.db;
