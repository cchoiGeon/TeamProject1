const express = require('express');
const ejs = require('ejs');
const cookieParser = require('cookie-parser')
const session = require('express-session');
const bodyParser = require('body-parser');
const server = express();
const dotenv = require("dotenv")
dotenv.config()

const passport = require('passport')
const passportConfig = require('./passport/index.js')
passportConfig()

// 라우팅 
const selectRouter = require('./Router/select_campus/select_campus');
const reportRouter = require('./Router/report_campus/report_campus');

const pageRouter = require('./Router/page.js')
const authRouter = require('./Router/auth.js')
const adminbroRouter = require('./Router/adminbro.js')
const homepage = require('./Router/homepage.js')

//set 메서드
server.set('view engine', 'ejs');
server.set('html',require('ejs').renderFile);
server.set('views', './views');

//use 메서드
server.use(express.static('therest'));
server.use(express.static('uploads'));
server.use(express.json());
server.use(cookieParser(process.env.COOKIE_SECRET))
server.use(bodyParser.urlencoded({ extended: false}));
server.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly : true,
    secure : false,
  },
}))
server.use(passport.initialize());
server.use(passport.session());

//라우팅
server.use('/',homepage)
server.use('/page',pageRouter)
server.use('/auth',authRouter)
server.use('/adminbro',adminbroRouter)
server.use('/select',selectRouter)
server.use('/report',reportRouter)

/// 404 처리
server.use((req,res,next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404
  next(error)
})
/// error 처리
server.use((err,req,res,next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error')
})
server.listen(3000);