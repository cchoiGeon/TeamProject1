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

///////////////////// 잡다한 것들 부분 ////////////////////////////////

exports.how_use = (req,res) => {
  loginbox(req,res)
  res.render('how_use',{'login':login})
}
exports.map = (req,res) => {
  loginbox(req,res)
  res.render('map',{'login':login})
}

///////////////////// register 부분 ////////////////////////////////

exports.register = (req,res) => {
  res.render('register')
}

exports.register2 = (req,res) => {
  res.render('register2')
}

///////////////////// mypage 부분 ////////////////////////////////

exports.mypage = async(req,res,next) => {
  try{
    loginbox(req,res)
    let register = await db.query('SELECT * FROM register WHERE id=?',[req.user[0].id])
    register = register[0]
    const warning_count = register[0].warning;
    const warning_frist = register[0].warning_frist;
    const warning_second = register[0].warning_second;
    const warning_thrid = register[0].warning_thrid;
    return res.render('mypage',{'login':login,'warning_count':warning_count,'warning_frist':warning_frist,'warning_second':warning_second,'warning_thrid':warning_thrid})
  }
  catch(error){
    console.error(error)
    next(error)
  }
}


///////////////////// login 부분 ////////////////////////////////

exports.login= (req,res) => {
  res.render('login')
}
