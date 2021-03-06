var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const session = require('express-session');
const FileStore = require('session-file-store')(session);

const passport = require('passport');
const authenticate = require('./authenticate');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const manualRouter = require('./routes/manualRouter');
const conceptRouter = require("./routes/conceptRouter");
const authorRouter = require('./routes/authorRouter');
const experienceRouter = require('./routes/experienceRouter');
const educationRouter = require('./routes/educationRouter');
const clientRouter = require('./routes/clientRouter');
const aboutRouter = require('./routes/aboutRouter');
const commentRouter = require('./routes/commentRouter');

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/mylabguru';
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'),
  err => console.log(err)
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser("12345-67890-09876-54321"));

app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

app.use(passport.initialize());
app.use(passport.session());

function auth(req, res, next) {
  console.log(req.user);

  if (!req.user) {
    const err = new Error('You are not authenticated!');
    err.status = 401;
    return next(err);
  } else {
    return next();
  }
}

app.use(express.static(path.join(__dirname, 'public')));
//Annonymous Users
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/manuals', manualRouter);
app.use('/concepts', conceptRouter);
app.use('/about', aboutRouter);

//Authenticated Users
app.use(auth);
app.use('/authors', authorRouter);
app.use('/experience', experienceRouter);
app.use('/education', educationRouter);
app.use('/clients', clientRouter);
app.use('/comments', commentRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
