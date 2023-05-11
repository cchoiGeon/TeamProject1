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


router.get('/adminbro',adminbro)
router.post('/adminbro/process',adminbro_process)

router.get('/adminbro/report',adminbro_report)
router.post('/adminbro/report/process',adminbro_report_process)  

router.get('/adminbro/user',adminbro_user)
router.post('/adminbro/user/process',adminbro_user_process)

router.get('/adminbro/img/:id',adminbro_img)

module.exports = router