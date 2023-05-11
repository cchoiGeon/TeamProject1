const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('../../db')
const {isLoggedIn} = require('../../middlewares/index');
const { status } = require('init');

const campuslist = ['A','B','C','D','E','Sanyung']

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
router.get("/",isLoggedIn,(req,res)=>{
  loginbox(req,res)
  res.render('report',{'login':login})
})


for(let i=0; i<campuslist.length; i++){
  router.get(`/${campuslist[i]}`,isLoggedIn,(req,res)=>{
    loginbox(req,res)
    if(campuslist[i]==='Sanyung'){
      return res.render('reportwriteSanyung',{'login':login})
    }
    return res.render('reportwrite',{'login':login,'campuslist':campuslist[i]})
  })
}

for(let i=0; i<campuslist.length; i++){
 router.post(`/${campuslist[i]}/process`,async(req,res)=>{
    let post = req.body;
    let reportcontent = post.reportcontent;
    let selectroom = post.selectroom;
    try{
      if(parseInt(selectroom)===201 || parseInt(selectroom)===202 || parseInt(selectroom)===203 || parseInt(selectroom)===204 || parseInt(selectroom)===205 || parseInt(selectroom)===206 ){
        let status = await db.query(`SELECT * FROM ${campuslist[i]}floor2 WHERE number=?`,[parseInt(selectroom)])
        status = status[0]
        if(status[0].now_userid){
          await db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.user.id,status[0].now_userid])
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
        }else if(!status[0].now_userid && status[0].past_userid){
          await db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.user.id,status[0].past_userid])
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
        }else{
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('잘못 입력하셨습니다'); window.location='/report/${campuslist[i]}'</script></html>`);
        }
      }
      else if(parseInt(selectroom)===301 || parseInt(selectroom)===302 || parseInt(selectroom)===303 || parseInt(selectroom)===304 || parseInt(selectroom)===305 || parseInt(selectroom)===306){
        let status = await db.query(`SELECT * FROM ${campuslist[i]}floor3 WHERE number=?`,[parseInt(selectroom)])
        status = status[0]
        if(status[0].now_userid){
          await db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.user.id,status[0].now_userid])
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
        }else if(!status[0].now_userid && status[0].past_userid){
          await db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.user.id,status[0].past_userid])
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
        }else{
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('잘못 입력하셨습니다'); window.location='/report/${campuslist[i]}'</script></html>`);
        }
      }
      else if(parseInt(selectroom)===401 || parseInt(selectroom)===402 || parseInt(selectroom)===403 || parseInt(selectroom)===404 || parseInt(selectroom)===405 || parseInt(selectroom)===406){
        let status = await db.query(`SELECT * FROM ${campuslist[i]}floor4 WHERE number=?`,[parseInt(selectroom)]) 
        status = status[0]        
        if(status[0].now_userid){
          await db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.user.id,status[0].now_userid])
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
        }else if(!status[0].now_userid && status[0].past_userid){
          await db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.user.id,status[0].past_userid])
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
        }else{
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('잘못 입력하셨습니다'); window.location='/report/${campuslist[i]}'</script></html>`);
        }
      }
      else if(parseInt(selectroom)===501 || parseInt(selectroom)===502 || parseInt(selectroom)===503 || parseInt(selectroom)===504 || parseInt(selectroom)===505 || parseInt(selectroom)===506){
        let status = await db.query(`SELECT * FROM ${campuslist[i]}floor5 WHERE number=?`,[parseInt(selectroom)])
        status = status[0]
        if(status[0].now_userid){
          await db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.user.id,status[0].now_userid])
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
        }else if(!status[0].now_userid && status[0].past_userid){
          await db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.user.id,status[0].past_userid])
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
        }else{
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('잘못 입력하셨습니다'); window.location='/report/${campuslist[i]}'</script></html>`);
        }
      }
    }catch(error){
      console.error(error)
      next(error)
    }
  })
}

module.exports = router;