const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('../../db')
const {isLoggedIn} = require('../../middlewares/index')
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

for(let i=0; i<campuslist.length; i++){
  router.get(`/${campuslist[i]}`,isLoggedIn,async(req,res)=>{
    try{
      loginbox(req,res)
      let floor2 = await db.query(`SELECT * FROM ${campuslist[i]}floor2`)
      let floor3 = await db.query(`SELECT * FROM ${campuslist[i]}floor3`)
      let floor4 = await db.query(`SELECT * FROM ${campuslist[i]}floor4`)
      floor2 = floor2[0]
      floor3 = floor3[0]
      floor4 = floor4[0]
      let count_floor2;
      let count_floor3;
      let count_floor4;
      let count_floor5;
      for(let i=2; i < 5; i++){ // 층 
        for(let j=0; j < 6; j++){ // 인덱스 값(호수)
          if(`floor${i}`[j].status === '사용가능'){
            `count_floor${i}`+=1
          }
        }
      }
      if(`${campuslist[i]}`==='Sanyung'){
        let floor5 = await db.query(`SELECT * FROM Sanyung floor5`)
        floor5 = floor5[0]
        for(let k=0; k<6; k++){
          if(floor5[k].status === '사용가능'){
            count_floor5+=1
          }
        }
        res.render('searchSanyung',{'login':login,'campuslist':campuslist[i],'floor2':count_floor2,'floor3':count_floor3,'floor4':count_floor4,'floor5':count_floor5})
      }
      res.render('search',{'login':login,'campuslist':campuslist[i],'floor2':count_floor2,'floor3':count_floor3,'floor4':count_floor4})
    }catch(error){
      console.error(error)
      next(error)
    } 
  })
}

for(let i=0; i<campuslist.length; i++){
 router.post(`/${campuslist[i]}/process`,(req,res)=>{
    let post = req.body;
    if(post.floor2){
      return res.redirect(`/select/${campuslist[i]}_floor2`)
    }else if(post.floor3){
      return res.redirect(`/select/${campuslist[i]}_floor3`)
    }else if(post.floor4){
      return res.redirect(`/select/${campuslist[i]}_floor4`)
    }else if(post.floor5){
      return res.redirect(`/select/${campuslist[i]}_floor5`)
    }else if(post.floor6){
      return res.redirect(`/select/${campuslist[i]}_floor6`)
    }
  })
}

for(let i=0; i<campuslist.length; i++){
  router.get(`/${campuslist[i]}_floor2`,isLoggedIn,async(req,res)=>{
    try{
      let floor2 = await db.query(`SELECT * FROM ${campuslist[i]}floor2`)
      floor2 = floor2[0]
      //for문으로 감싸기
      let f201 = floor2[0].number
      let f202 = floor2[1].number
      let f203 = floor2[2].number
      let f204 = floor2[3].number
      let f205 = floor2[4].number
      let f206 = floor2[5].number
      let fs201 = floor2[0].status;
      let fs202 = floor2[1].status;
      let fs203 = floor2[2].status;
      let fs204 = floor2[3].status;
      let fs205 = floor2[4].status;
      let fs206 = floor2[5].status;
      res.render('searchfloor',{'campuslist':campuslist[i],'selectfloor':'floor2','selectfloor01':f201,'selectfloor02':f202,'selectfloor03':f203,'selectfloor04':f204,'selectfloor05':f205,'selectfloor06':f206,'floor_status01':fs201,'floor_status02':fs202,'floor_status03':fs203,'floor_status04':fs204,'floor_status05':fs205,'floor_status06':fs206})
    }catch(error){
      console.error(error)
      next(error)
    }
  })
}

for(let i=0; i<campuslist.length; i++){
  router.post(`/${campuslist[i]}_floor2/process`,(req,res)=>{
    let post = req.body;
    let select201 = post.class201
    let select202 = post.class202
    let select203 = post.class203
    let select204 = post.class204
    let select205 = post.class205
    let select206 = post.class206
    let list = [select201,select202,select203,select204,select205,select206]
    db.query('SELECT * FROM register WHERE id=?',[req.user[0].id],function(err,register){
      db.query(`SELECT * FROM ${campuslist[i]}floor2`,function(err2,floor2){
        for(let k=0; k<list.length; k++){
          if(list[k] === '입실'){
            if(floor2[k].status === '사용가능'){
              console.log()
              if(register[0].id === req.user[0].id && register[0].usetrue === '사용가능'){
                db.query(`UPDATE ${campuslist[i]}floor2 SET status=?, time=NOW(), now_userid=? WHERE number=?`,['사용 중',req.user[0].id,parseInt(floor2[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',['사용 중',req.user[0].id],
                  function(err4,result2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('입실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
                });
              }else if(register[0].id === req.user[0].id && register[0].usetrue === '사용 중'){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실이 있습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }else if(floor2[k].status === '예약 중' && floor2[k].now_userid === req.user[0].id){
              db.query(`UPDATE ${campuslist[i]}floor2 SET status=?, time=NOW(), now_userid=? WHERE number=?`,['사용 중',req.user[0].id,parseInt(floor2[k].number)],
              function(err3,result){
                db.query('UPDATE register SET usetrue=? WHERE id=?',['사용 중',req.user[0].id],
                function(err4,result2){
                  return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('입실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                });
              });
              return false;
            }else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
          else if(list[k] ==='퇴실'){
            if(floor2[k].status === '사용 중' || floor2[k].status === '예약 중'){
              if(floor2[k].now_userid === req.user[0].id && register[0].usetrue === '사용 중'){
                db.query(`UPDATE ${campuslist[i]}floor2 SET status=?, time=NOW(), past_userid=?, now_userid=? WHERE number=?`,
                ['사용가능',req.user[0].id,null,parseInt(floor2[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',
                  ['사용가능',req.user[0].id],function(err4,register2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('퇴실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
                })
                return false;
              }else if(floor2[k].now_userid != req.user[0].id){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }
            else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('빈 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
          else if(list[k] === '예약'){
            if(floor2[k].status === '사용가능'){
              if(register[0].id === req.user[0].id && register[0].usetrue === '사용가능'){
                db.query(`UPDATE ${campuslist[i]}floor2 SET status=?, time=NOW(), now_userid=? WHERE number=?`,
                ['예약 중',req.user[0].id,parseInt(floor2[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',
                  ['사용 중',req.user[0].id],function(err4,register2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('예약이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
                });
                return false;
              }else if(register[0].id === req.user[0].id && register[0].usetrue === '사용 중'){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실이 있습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }
            else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
        }
      })
    })
  })
}
for(let i=0; i<campuslist.length; i++){
  router.get(`/${campuslist[i]}_floor3`,isLoggedIn,(req,res)=>{
    db.query(`SELECT * FROM ${campuslist[i]}floor3`,function(err,floor3){
      if(err){
        console.log(err)
      }
      let f301 = floor3[0].number
      let f302 = floor3[1].number
      let f303 = floor3[2].number
      let f304 = floor3[3].number
      let f305 = floor3[4].number
      let f306 = floor3[5].number
      let fs301 = floor3[0].status;
      let fs302 = floor3[1].status;
      let fs303 = floor3[2].status;
      let fs304 = floor3[3].status;
      let fs305 = floor3[4].status;
      let fs306 = floor3[5].status;
      res.render('searchfloor',{'campuslist':campuslist[i],'selectfloor':'floor3','selectfloor01':f301,'selectfloor02':f302,'selectfloor03':f303,'selectfloor04':f304,'selectfloor05':f305,'selectfloor06':f306,'floor_status01':fs301,'floor_status02':fs302,'floor_status03':fs303,'floor_status04':fs304,'floor_status05':fs305,'floor_status06':fs306})
    })
  })
}
for(let i=0; i<campuslist.length; i++){
  router.post(`/${campuslist[i]}_floor3/process`,(req,res)=>{
    let post = req.body;
    let select301 = post.class301
    let select302 = post.class302
    let select303 = post.class303
    let select304 = post.class304
    let select305 = post.class305
    let select306 = post.class306
    let list = [select301,select302,select303,select304,select305,select306]
    db.query('SELECT * FROM register WHERE id=?',[req.user[0].id],function(err,register){
      db.query(`SELECT * FROM ${campuslist[i]}floor3`,function(err2,floor3){
        for(let k=0; k<list.length; k++){
          if(list[k] === '입실'){
            if(floor3[k].status === '사용가능'){
              if(register[0].id === req.user[0].id && register[0].usetrue === '사용가능'){
                db.query(`UPDATE ${campuslist[i]}floor3 SET status=?, time=NOW(), now_userid=? WHERE number=?`,['사용 중',req.user[0].id,parseInt(floor3[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',['사용 중',req.user[0].id],
                  function(err4,result2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('입실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
                });
              }else if(register[0].id === req.user[0].id && register[0].usetrue === '사용 중'){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실이 있습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }else if(floor3[k].status === '예약 중' && floor3[k].now_userid === req.user[0].id){
              db.query(`UPDATE ${campuslist[i]}floor3 SET status=?, time=NOW(), now_userid=? WHERE number=?`,['사용 중',req.user[0].id,parseInt(floor3[k].number)],
              function(err3,result){
                db.query('UPDATE register SET usetrue=? WHERE id=?',['사용 중',req.user[0].id],
                function(err4,result2){
                  return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('입실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                });
              });
              return false;
            }
            else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
          else if(list[k] ==='퇴실'){
            if(floor3[k].status === '사용 중' || floor3[k].status === '예약 중'){
              if(floor3[k].now_userid ===req.user[0].id && register[0].usetrue === '사용 중'){
                db.query(`UPDATE ${campuslist[i]}floor3 SET status=?, time=NOW(), past_userid=?, now_userid=? WHERE number=?`,
                ['사용가능',req.user[0].id,null,parseInt(floor3[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',
                  ['사용가능',req.user[0].id],function(err4,register2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('퇴실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
                })
                return false;
              }else if(floor3[k].now_userid != req.user[0].id){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }
            else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('빈 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
          else if(list[k] === '예약'){
            if(floor3[k].status === '사용가능'){
              if(register[0].id === req.user[0].id && register[0].usetrue === '사용가능'){
                db.query(`UPDATE ${campuslist[i]}floor3 SET status=?, time=NOW(), now_userid=? WHERE number=?`,
                ['예약 중',req.user[0].id,parseInt(floor3[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',
                  ['사용 중',req.user[0].id],function(err4,register2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('예약이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
                });
                return false;
              }else if(register[0].id === req.user[0].id && register[0].usetrue === '사용 중'){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실이 있습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }
            else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
        }
      })
    })
  })
}
for(let i=0; i<campuslist.length; i++){
  router.get(`/${campuslist[i]}_floor4`,isLoggedIn,(req,res)=>{
    db.query(`SELECT * FROM ${campuslist[i]}floor4`,function(err,floor4){
      if(err){
        console.log(err)
      }
      let f401 = floor4[0].number
      let f402 = floor4[1].number
      let f403 = floor4[2].number
      let f404 = floor4[3].number
      let f405 = floor4[4].number
      let f406 = floor4[5].number
      let fs401 = floor4[0].status;
      let fs402 = floor4[1].status;
      let fs403 = floor4[2].status;
      let fs404 = floor4[3].status;
      let fs405 = floor4[4].status;
      let fs406 = floor4[5].status;
      res.render('searchfloor',{'campuslist':campuslist[i],'selectfloor':'floor4','selectfloor01':f401,'selectfloor02':f402,'selectfloor03':f403,'selectfloor04':f404,'selectfloor05':f405,'selectfloor06':f406,'floor_status01':fs401,'floor_status02':fs402,'floor_status03':fs403,'floor_status04':fs404,'floor_status05':fs405,'floor_status06':fs406})
    })
  })
}
for(let i=0; i<campuslist.length; i++){
  router.post(`/${campuslist[i]}_floor4/process`,(req,res)=>{
    let post = req.body;
    let select401 = post.class401
    let select402 = post.class402
    let select403 = post.class403
    let select404 = post.class404
    let select405 = post.class405
    let select406 = post.class406
    let list = [select401,select402,select403,select404,select405,select406]
    db.query('SELECT * FROM register WHERE id=?',[req.user[0].id],function(err,register){
      db.query(`SELECT * FROM ${campuslist[i]}floor4`,function(err2,floor4){
        for(let k=0; k<list.length; k++){
          if(list[k] === '입실'){
            if(floor4[k].status === '사용가능'){
              if(register[0].id === req.user[0].id && register[0].usetrue === '사용가능'){
                db.query(`UPDATE ${campuslist[i]}floor4 SET status=?, time=NOW(), now_userid=? WHERE number=?`,['사용 중',req.user[0].id,parseInt(floor4[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',['사용 중',req.user[0].id],
                  function(err4,result2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('입실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
                });
              }else if(register[0].id === req.user[0].id && register[0].usetrue === '사용 중'){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실이 있습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }else if(floor4[k].status === '예약 중' && floor4[k].now_userid === req.user[0].id){
              db.query(`UPDATE ${campuslist[i]}floor4 SET status=?, time=NOW(), past_userid=?, now_userid=? WHERE number=?`,
                ['사용가능',req.user[0].id,null,parseInt(floor4[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',
                  ['사용가능',req.user[0].id],function(err4,register2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('퇴실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
              })
              return false;
            }else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
          else if(list[k] ==='퇴실'){
            if(floor4[k].status === '사용 중' || floor4[k].status === '예약 중'){
              if(floor4[k].now_userid === req.user[0].id && register[0].usetrue === '사용 중'){
                db.query(`UPDATE ${campuslist[i]}floor4 SET status=?, time=NOW(), past_userid=?, now_userid=? WHERE number=?`,
                ['사용가능',req.user[0].id,null,parseInt(floor4[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',
                  ['사용가능',req.user[0].id],function(err4,register2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('퇴실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
                })
                return false;
              }else if(floor4[k].now_userid != req.user[0].id){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }
            else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('빈 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
          else if(list[k] === '예약'){
            if(floor4[k].status === '사용가능'){
              if(register[0].id === req.user[0].id && register[0].usetrue === '사용가능'){
                db.query(`UPDATE ${campuslist[i]}floor4 SET status=?, time=NOW(), now_userid=? WHERE number=?`,
                ['예약 중',req.user[0].id,parseInt(floor4[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',
                  ['사용 중',req.user[0].id],function(err4,register2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('예약이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
                });
                return false;
              }else if(register[0].id === req.user[0].id && register[0].usetrue === '사용 중'){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실이 있습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }
            else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
        }
      })
    })
  })
}
for(let i=0; i<campuslist.length; i++){
  router.get(`/${campuslist[i]}_floor5`,(req,res)=>{
    db.query(`SELECT * FROM ${campuslist[i]}floor5`,function(err,floor5){
      if(err){
        console.log(err)
      }
      let f501 = floor5[0].number
      let f502 = floor5[1].number
      let f503 = floor5[2].number
      let f504 = floor5[3].number
      let f505 = floor5[4].number
      let f506 = floor5[5].number
      let fs501 = floor5[0].status;
      let fs502 = floor5[1].status;
      let fs503 = floor5[2].status;
      let fs504 = floor5[3].status;
      let fs505 = floor5[4].status;
      let fs506 = floor5[5].status;
      res.render('searchfloor',{'campuslist':campuslist[i],'selectfloor':'floor5','selectfloor01':f501,'selectfloor02':f502,'selectfloor03':f503,'selectfloor04':f504,'selectfloor05':f505,'selectfloor06':f506,'floor_status01':fs501,'floor_status02':fs502,'floor_status03':fs503,'floor_status04':fs504,'floor_status05':fs505,'floor_status06':fs506})
    })
  })
}
for(let i=0; i<campuslist.length; i++){
  router.post(`/${campuslist[i]}_floor5/process`,(req,res)=>{
    let post = req.body;
    let select501 = post.class501
    let select502 = post.class502
    let select503 = post.class503
    let select504 = post.class504
    let select505 = post.class505
    let select506 = post.class506
    let list = [select501,select502,select503,select504,select505,select506]
    db.query('SELECT * FROM register WHERE id=?',[req.user[0].id],function(err,register){
      db.query(`SELECT * FROM ${campuslist[i]}floor5`,function(err2,floor5){
        for(let k=0; k<list.length; k++){
          if(list[k] === '입실'){
            if(floor5[k].status === '사용가능'){
              if(register[0].id === req.user[0].id && register[0].usetrue === '사용가능'){
                db.query(`UPDATE ${campuslist[i]}floor5 SET status=?, time=NOW(), now_userid=? WHERE number=?`,['사용 중',req.user[0].id,parseInt(floor5[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',['사용 중',req.user[0].id],
                  function(err4,result2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('입실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
                });
              }else if(register[0].id === rreq.user[0].id && register[0].usetrue === '사용 중'){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실이 있습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }else if(floor5[k].status === '예약 중' && floor5[k].now_userid === req.user[0].id){
              db.query(`UPDATE ${campuslist[i]}floor5 SET status=?, time=NOW(), now_userid=? WHERE number=?`,['사용 중',req.user[0].id,parseInt(floor5[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',['사용 중',req.user[0].id],
                  function(err4,result2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('입실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
              });
              return false;
            }
            else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
          else if(list[k] ==='퇴실'){
            if(floor5[k].status === '사용 중' || floor5[k].status === '예약 중'){
              if(floor5[k].now_userid === req.user[0].id && register[0].usetrue === '사용 중'){
                db.query(`UPDATE ${campuslist[i]}floor5 SET status=?, time=NOW(), past_userid=?, now_userid=? WHERE number=?`,
                ['사용가능',req.user[0].id,null,parseInt(floor5[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',
                  ['사용가능',req.user[0].id],function(err4,register2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('퇴실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
                })
                return false;
              }else if(floor5[k].now_userid != req.user[0].id){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }
            else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('빈 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
          else if(list[k] === '예약'){
            if(floor5[k].status === '사용가능'){
              if(register[0].id === req.user[0].id && register[0].usetrue === '사용가능'){
                db.query(`UPDATE ${campuslist[i]}floor5 SET status=?, time=NOW(), now_userid=? WHERE number=?`,
                ['예약 중',req.user[0].id,parseInt(floor5[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',
                  ['사용 중',req.user[0].id],function(err4,register2){
                    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('예약이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
                  });
                });
                return false;
              }else if(register[0].id === req.user[0].id && register[0].usetrue === '사용 중'){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실이 있습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }
            else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다.'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
        }
      })
    })
  })
}
module.exports = router;