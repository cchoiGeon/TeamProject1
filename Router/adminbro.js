const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const bodyParser = require('body-parser');
const router = express.Router();
const dotenv = require('dotenv')
dotenv.config()
const {
  adminbro,adminbro_process,
  adminbro_report,adminbro_report_process,
  adminbro_user,adminbro_user_process,
  adminbro_img,} = require('../controllers2/adminbro')


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


router.get('/',adminbro)
router.post('/process',adminbro_process)

router.get('/report',adminbro_report)
router.post('report/process',adminbro_report_process)  

router.get('/user',adminbro_user)
router.post('/user/process',adminbro_user_process)

router.get('/img/:id',adminbro_img)

module.exports = router