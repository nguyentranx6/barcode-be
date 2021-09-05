var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors");

/* Set router */
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usersRouter');
var barcodeRouter = require('./routes/barcode-router');
var settingRouter = require('./routes/settingRouter');
var notifyRouter = require('./routes/notifyRouter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Cors
app.use(cors());
app.options("*", cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Router
app.use('/', indexRouter);
app.use('/api/user', usersRouter);
app.use('/api/barcode', barcodeRouter);
app.use('/api/setting', settingRouter);
app.use('/api/notify', notifyRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
