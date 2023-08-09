const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('../../db')
const {isLoggedIn} = require('../../middlewares/index')
const campuslist = ['A','B','C','D','E','Sanyung']
const floorlist = ['floor2','floor3','floor4','floor5']
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
router.use((req,res,next)=>{
  res.locals.floor=0;
  next()
})

function loginbox(req,res){
  if(req.user){
    login = `<li><a class="dropdown-item" href="/auth/logout/process">로그아웃</a></li>`;
  }else{
    login = `<li><a class="dropdown-item" href="/login">로그인</a></li>
      <li><a class="dropdown-item" href="/register">회원가입</a></li>`;
  }
}

for(let i=0; i<campuslist.length; i++){
  router.get(`/${campuslist[i]}`,isLoggedIn,async(req,res,next)=>{
    try{
      loginbox(req,res)
      let floor2 = (await db.query(`SELECT * FROM ${campuslist[i]}floor2`))[0]
      let floor3 = (await db.query(`SELECT * FROM ${campuslist[i]}floor3`))[0]
      let floor4 = (await db.query(`SELECT * FROM ${campuslist[i]}floor4`))[0]
      let count_floor2 = 0
      let count_floor3 = 0
      let count_floor4 = 0
      for(let j=0; j < 6; j++){
        if(floor2[j].status === '사용가능'){
          count_floor2+=1
        }
        if(floor3[j].status === '사용가능'){
          count_floor3+=1
        }
        if(floor4[j].status === '사용가능'){
          count_floor4+=1
        }
      } 
      if(`${campuslist[i]}`==='Sanyung'){
        let floor5 = (await db.query(`SELECT * FROM ${campuslist[i]}floor5`))[0]
        let count_floor5 = 0
        for(let k=0; k<6; k++){
          if(floor5[k].status === '사용가능'){
            count_floor5+=1
          }
        }
        return res.render('searchSanyung',{'login':login,'campuslist':campuslist[i],'floor2':count_floor2,'floor3':count_floor3,'floor4':count_floor4,'floor5':count_floor5})
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
    }
  })
}

for(let i=0; i<campuslist.length; i++){
  for(let j=0; j<floorlist.length; j++){
    router.get(`/${campuslist[i]}_${floorlist[j]}`,isLoggedIn, async (req,res,next)=>{
      try{
        let floor = (await db.query(`SELECT * FROM ${campuslist[i]}${floorlist[j]}`))[0]
        return res.render('searchfloor',{
          'campuslist':campuslist[i],'selectfloor':floorlist[j],'selectfloor01':floor[0].number,'selectfloor02':floor[1].number,'selectfloor03':floor[2].number,'selectfloor04':floor[3].number,'selectfloor05':floor[4].number,'selectfloor06':floor[5].number,
          'floor_status01':floor[0].status,'floor_status02':floor[1].status,'floor_status03':floor[2].status,'floor_status04':floor[3].status,'floor_status05':floor[4].status,'floor_status06':floor[5].status
        })
      }catch(error){
        console.error(error)
        next(error)
      }
    })
  }
}

for(let i=0; i<campuslist.length; i++){
  for(let j=0; j<floorlist.length; j++){
    router.post(`/${campuslist[i]}_${floorlist[j]}/process`,async(req,res,next)=>{
      try{
        let list;
        let post = req.body
        if(floorlist[j]==='floor2'){
          list = [post.class201,post.class202,post.class203,post.class204,post.class205,post.class206]
        }else if(floorlist[j]==='floor3'){
          list = [post.class301,post.class302,post.class303,post.class304,post.class305,post.class306]
        }else if(floorlist[j]==='floor4'){
          list = [post.class401,post.class402,post.class403,post.class404,post.class405,post.class406]
        }else if(floorlist[j]==='floor5'){
          list = [post.class501,post.class502,post.class503,post.class504,post.class505,post.class506]
        }
        let register = (await db.query('SELECT * FROM register WHERE id=?',[req.user.id]))[0][0]
        let floor = (await db.query(`SELECT * FROM ${campuslist[i]}${floorlist[j]}`))[0]

        for(let k=0; k<list.length; k++){
          if(list[k] === '입실'){
            if(floor[k].status === '사용가능'){
              if(register.id === req.user.id && register.usetrue === '사용가능'){
                await db.query(`UPDATE ${campuslist[i]}${floorlist[j]} SET status=?, time=NOW(), now_userid=? WHERE number=?`,['사용 중',req.user.id,parseInt(floor[k].number)])
                await db.query('UPDATE register SET usetrue=? WHERE id=?',['사용 중',req.user.id])
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('입실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }else if(register.id === req.user.id && register.usetrue === '사용 중'){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실이 있습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }else if(floor[k].status === '예약 중' && floor[k].now_userid === req.user.id){
              await db.query(`UPDATE ${campuslist[i]}${floorlist[j]} SET status=?, time=NOW(), now_userid=? WHERE number=?`,['사용 중',req.user.id,parseInt(floor[k].number)]) 
              await db.query('UPDATE register SET usetrue=? WHERE id=?',['사용 중',req.user.id])
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('입실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
          else if(list[k] ==='퇴실'){
            if(floor[k].status === '사용 중' || floor[k].status === '예약 중'){
              if(floor[k].now_userid === req.user.id && register.usetrue === '사용 중'){
                await db.query(`UPDATE ${campuslist[i]}${floorlist[j]} SET status=?, time=NOW(), past_userid=?, now_userid=? WHERE number=?`,['사용가능',req.user.id,null,parseInt(floor[k].number)])
                await db.query('UPDATE register SET usetrue=? WHERE id=?',['사용가능',req.user.id])
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('퇴실이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }else if(floor[k].now_userid != req.user.id){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }
            else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('빈 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
          else if(list[k] === '예약'){
            if(floor[k].status === '사용가능'){
              if(register.id === req.user.id && register.usetrue === '사용가능'){
                await db.query(`UPDATE ${campuslist[i]}${floorlist[j]} SET status=?, time=NOW(), now_userid=? WHERE number=?`,['예약 중',req.user.id,parseInt(floor[k].number)])
                await db.query('UPDATE register SET usetrue=? WHERE id=?',['사용 중',req.user.id])
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('예약이 완료 되셨습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }else if(register.id === req.user.id && register.usetrue === '사용 중'){
                return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실이 있습니다'); window.location='/select/${campuslist[i]}'</script></html>`);
              }
            }
            else{
              return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 강의실입니다'); window.location='/select/${campuslist[i]}'</script></html>`);
            }
          }
        }
      }catch(error){
        console.error(error)
        next(error)
      }
    })
  }
}

module.exports = router;