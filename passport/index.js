const passport = require('passport');
const local = require('./localStrategy');
const db = require('../db')

module.exports = () => {
  passport.serializeUser((user, done) => { // 로그인 시 실행됨 , req.session 객체에 어떤 데이터를 저장할지 정하는 메서드 
    console.log(user.id)
    done(null, user.id); // user.id 는 deserializeUser 에 있는 첫 번째 인수로 감 -> id
  });

  passport.deserializeUser(async(id, done) => { // 각 요청마다 실행,  id 안에는 위에서 보내준 user.id 사용자 id가 담겨져있음
    let user = (await db.query('SELECT * FROM register WHERE id=?',[id]))[0][0]// db에서 사용자 아이디가 있는지 찾아봐줌
    if(user){
      done(null,user) // req.user을 만들어줌, req.user에는 사용자 정보가 담겨있음
    }  
    else{
      return done(null)// 없으면 에러 
    }
  })
  local();
};
