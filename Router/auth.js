const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const bodyParser = require('body-parser');
const router = express.Router();
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()
//
const multer = require("multer");
//MULTER 사용
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,'./uploads') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null,path.basename(file.originalname,ext) + "-" + Date.now() + ext); // cb 콜백함수를 통해 전송된 파일 이름 설정
  },
})
const upload = multer({storage: storage})

const {isNotLoggedIn} = require('../middlewares/index')
//
const {
  login_process,logout,
  register_process,register2_process} = require('../controllers2/auth')


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

router.post('/login/process',login_process)
router.get('/logout/process',logout)
router.post('/register/process',isNotLoggedIn,register_process)
router.post('/register2/process',upload.single('card'),isNotLoggedIn,register2_process)

module.exports = router