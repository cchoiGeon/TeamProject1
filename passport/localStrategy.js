const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../db')
// const bcrypt = require('bcrypt')

module.exports = () => {
  passport.use(new LocalStrategy({ // 전략에 관한 설정을 하는 곳 
    usernameField: 'id', // 로그인 라우터의 req.body 속성명을 적으면 됨 ex ) req.body.email
    passwordField: 'password', // 로그인 라우터의 req.body 속성명을 적으면 됨 ex) req.body.password
    passReqToCallback: false,
  }, async (id, password, done) => { // 실제 전략을 수행하는 함수로 이게 메인임 로그인을 완료시키는 메인 함수
    try {
      let exUser = (await db.query('SELECT * FROM register WHERE id=?',[id]))[0][0]
      if(!exUser){ 
        return done(null, false, { message: '가입되지 않은 회원입니다.' }); // 회원정보 X
      }
      if(password == exUser.password) {
        return done(null, exUser);
      } else {
        return done(null, false, { message: '비밀번호가 일치하지 않습니다.' }); // 로그인 실패
      }
    }catch(error) {
      console.error(error);
      done(error); // 서버 에러시
    }
  }));
};
