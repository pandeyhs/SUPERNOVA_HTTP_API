/**################################################################################
#(C) Copyright Pumpkin, Inc. All Rights Reserved.
#
#This file may be distributed under the terms of the License
#Agreement provided with this software.
#
#THIS FILE IS PROVIDED AS IS WITH NO WARRANTY OF ANY KIND,
#INCLUDING THE WARRANTY OF DESIGN, MERCHANTABILITY AND
#FITNESS FOR A PARTICULAR PURPOSE.
################################################################################**/

/**
* Include requirements
*/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

/**
 * Include Arg Parser for configuration and configure client javascript
 */
var args = require('./libs/argParser');
var clientConfiguration = {
  ip : args.get('ip', '192.168.1.70'),
  port : args.get('port', '9000')
};
var configOutput = "var SNOVA_CONFIG = " + JSON.stringify(clientConfiguration, null, 4) + ";";
var outputFile = path.join(__dirname, 'public/config.js');

fs.writeFile(outputFile, configOutput, function(err){
  if (err){
    console.log(err);
  } else {
    console.log("Server Configuration: " + outputFile);
  }
});

/**
* Use /routes/index.js to handle routing
*/
var routes = require('./routes/index');

/**
* Use Express.js
*/
var app = express();

/**
* Use EJS for templating
*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

/**
* Catch 404 and forward to error handler
*/
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers

/**
* Development error handler
* will print stacktrace
*/
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

/**
* production error handler
* no stacktraces leaked to user
*/
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;