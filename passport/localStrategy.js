const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
const db = require('../db')
// const bcrypt = require('bcrypt')

module.exports = () => {
  passport.use(new LocalStrategy({ // 전략에 관한 설정을 하는 곳 
    usernameField: 'id', // 로그인 라우터의 req.body 속성명을 적으면 됨 ex ) req.body.email
    passwordField: 'password', // 로그인 라우터의 req.body 속성명을 적으면 됨 ex) req.body.password
    passReqToCallback: false,
  }, async (id, password, done) => { // 실제 전략을 수행하는 함수로 이게 메인임 로그인을 완료시키는 메인 함수
    try {
      let exUser = await db.query('SELECT * FROM register WHERE id=?',[parseInt(id)])
      exUser = exUser[0]
      if(!exUser[0]){ 
        return done(null, false, { message: '아이디나 비밀번호가 일치하지 않습니다.' }); // 이 done 함수 누가 받는지 알아보고 수정하기
      }
      // const result = bcrypt.hash.compare(password,exUser[0].password)
      // password == exUser[0].password -> result 로 바꾸기
      if(password == exUser[0].password) {
        return done(null, exUser[0]);
      } else {
        return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
      }
    }catch(error) {
      console.error(error);
      done(error);
    }
  }));
};
