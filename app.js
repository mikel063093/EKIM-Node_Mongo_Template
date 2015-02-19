require('./models');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var serveIndex = require('serve-index');

var app = express();

global.__base = __dirname ;

var home = require('./controllers/home');
var user= require('./controllers/user');
var img =require('./controllers/img');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//uncomment to production
//app.set('env','production');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(express.favicon());
app.use(logger('dev'));
app.use(bodyParser.json());

// //app.use(bodyParser.raw({ type: 'form-data' }));
// app.use(bodyParser.json({ type: 'application/*+json' }));
// app.use(bodyParser.json({ type: '*+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(home);
app.use(user);
app.use(img);


function filter(filename, index, files, dir) {
  console.log("Filter: : :",{filename: filename, index : index, files: files, dir: dir});
}

app.use('/uploads', serveIndex('uploads', {'icons': true, 'hidden' : true, 'view' : 'details'}));
app.use(express.static(path.join(__dirname, 'uploads')));
//debe ir de ultimo para evitar problemas
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
  //  res.send(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log("error dev");
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log("error produtction");
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
