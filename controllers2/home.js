const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
const router = express.Router();
dotenv.config()
const db = require('../db/index')

router.use(bodyParser.urlencoded({ extended: false}));
router.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly : true,
    secure : false,
  },
}))
router.use(express.static('therest'));
router.use(express.static('uploads'));


function loginbox(req,res){
  if(req.user){
    login = `<li><a class="dropdown-item" href="/auth/logout/process">로그아웃</a></li>`;
  }else{
    login = `<li><a class="dropdown-item" href="/page/login">로그인</a></li>
      <li><a class="dropdown-item" href="/page/register">회원가입</a></li>`;
  }
}

exports.home = (req,res) =>{
  loginbox(req,res)
  res.render('index',{'login':login})
}