const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
const passport = require('passport');
const router = express.Router();
dotenv.config()
// const bcrypt = require('bcrypt')
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

exports.register_process = async(req,res,next) => { // 얘 auth 
  let post = req.body;
  try{
    let exUser = (await db.query('SELECT * FROM register WHERE id=?',[post.id]))[0][0]
    if(exUser){
      return res.redirect('/register')
    }
    if(9<post.id.length<=10 && post.password.length > 10){
      // const hash = await bcrypt.hash(post.password,12) 
      // 아래 post.password hash로 바꿔주기
      await db.query('INSERT INTO register(id,password,name,usetrue,warning) VALUES(?,?,?,?,?)',[post.id,post.password,post.name,'사용가능',0])
      return res.redirect('/login');
    }else{
      return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('아이디와 비밀번호를 다시 한 번 확인해주세요'); window.location='/register'</script></html>`)
    }
  }
  catch(error){
    console.error(error)
    next(error)
  }
}

exports.login_process = (req, res, next) => { // 얘 auth 
  passport.authenticate('local', (authError, user, info) => { // 로컬 로그인 전략 수행 ?
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) { // 아이디 비번 틀렸을 때 ?
      return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('아이디와 비밀번호를 다시 확인해주세요'); window.location='/login'</script></html>`);
    }
    return req.login(user, (loginError) => { // 성공했을 때
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
};

exports.logout = (req, res) => { // 얘 auth 
  req.logout(() => {
    res.redirect('/');
  });
};