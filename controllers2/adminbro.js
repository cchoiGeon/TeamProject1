const express = require('express');
const ejs = require('ejs');
const path = require('path')
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


exports.adminbro = (req,res) => {
  if(req.user.id == process.env.ADMIN_ID){
    return res.render("adminbro")
  }else{
    return res.status(404).send('ERROR!')
  }
}
exports.adminbro_process = (req,res) => {
  const post = req.body;
  if(post.report){
    return res.redirect('/adminbro/report')
  }else{
    return res.redirect('/adminbro/user')
  }
}
exports.adminbro_report = async(req,res,next) => {
  try{
    if(req.user[0].id == parseInt(process.env.ADMIN_ID)){
      let report = await db.query('SELECT * FROM report')
      report = report[0]
      let table= `<table>
          <tr>
            <td>건물 이름</td>
            <td>층</td>
            <td>신고 내용</td>
            <td>시간</td>
            <td>신고한 유저 아이디</td>
            <td>신고 당한 유저 아이디</td>
          </tr>`
        for(let i=0; i<report.length; i++){
          table += `
            <tr>
            <td>${report[i].building}</td>
            <td>${report[i].floornum}</td>
            <td>${report[i].content}</td>
            <td>${report[i].time}</td>
            <td>${report[i].report_userid}</td>
            <td>${report[i].be_reported_userid}</td>
            </tr>`
        }
        table+= `</table>`
        return res.render('adminbro_report',{'table':table})
    }
    else{
      return res.status(404).send('ERROR!')
    }
  }catch(error){
    console.error(error)
    next(error)
  }
}
exports.adminbro_report_process = async(req,res,next) => {
  try{
    const post = req.body;
    const reported_id = parseInt(post.reported_id)
    let result = await db.query('SELECT * FROM register WHERE id=?',[reported_id])
    result = result[0]
    const wcount =result[0].warning
    if(wcount === 0){
      let reported_building = post.reported_building +'동'+ post.reported_floor + '호'
      db.query('UPDATE register SET warning=?, warning_frist=? WHERE id=?',[1,reported_building,reported_id],function(err,result){
        return res.redirect('/adminbro/report')
      })
    }else if(wcount === 1){
      let reported_building2 = post.reported_building +'동'+ post.reported_floor + '호'
      db.query('UPDATE register SET warning=?, warning_second=? WHERE id=?',[2,reported_building2,reported_id],function(err,result){
        return res.redirect('/adminbro/report')
      })
    }else if(wcount === 2){
      let reported_building3 = post.reported_building +'동'+ post.reported_floor + '호'
      db.query('UPDATE register SET allow_login=? warning_thrid=? WHERE id=?',['false',reported_building3,reported_id],function(err,result){
        return res.redirect('/adminbro/report')
      })
    }
  }catch(error){
    console.error(error)
    next(error)
  }
}
exports.adminbro_user = async(req,res,next) => {
  try{
    if(req.user[0].id === parseInt(process.env.ADMIN_ID)){
      let register = await db.query('SELECT * FROM register')
      register = register[0]
      let table=`<table>
      <tr>
        <td>회원 이름</td>
        <td>회원 아이디</td>
        <td>강의실 사용 여부</td>
        <td>학생증</td>
        <td>학생증 확인 여부</td>
        <td>허락 여부</td>
        <td>아이디 삭제</td>
      </tr>`
      for(let i=0; i<register.length; i++){
        table+=`
        <tr>
          <td>${register[i].name}</td>
          <td>${register[i].id}</td>
          <td>${register[i].usetrue}</td>
          <td><a href="/adminbro/img/${register[i].id}">학생증 보러 가기</a></td>
          <td>${register[i].allow_login}</td>
          <td><button type="submit" name="allow" value="${register[i].id}">확인</button></td>
          <td><button type="submit" name="delete" value="${register[i].id}">확인</button></td>
        </tr>`
      }
      table+=``
      return res.render('adminbro_user',{'table':table})
    }
    else{
      return res.status(404).send('ERROR!')
    }
  }catch(error){
    console.error(error)
    next(error)
  }
}
exports.adminbro_user_process = async(req,res,next) => {
  try{
    const post = req.body;
    if(post.allow){
      await db.query('UPDATE register SET allow_login=? WHERE id=?',['true',post.allow])
      return res.redirect('/adminbro/user')
    }else if(post.delete){
      await db.query('DELETE FROM register WHERE id=?',[post.delete])
      return res.redirect('/adminbro/user')
    }
  }catch(error){
    console.error(error)
    next(error)
  }
}
exports.adminbro_img = async(req,res,next) => {
  try{
    if(req.user[0].id === parseInt(process.env.ADMIN_ID)){
      const user_id = parseInt(path.parse(req.params.id).base);
      let result = await db.query('SELECT * FROM register WHERE id=?',[user_id])
      result = result[0]
      const imgroot = result[0].student_card_root
      return res.render('adminbro_user_img',{'imgroot':imgroot})
    }
    else{
      return res.status(404).send('ERROR!')
    }
  }catch(error){
    console.error(error)
    next(error)
  }
}