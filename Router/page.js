const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const bodyParser = require('body-parser');
const router = express.Router();
const dotenv = require('dotenv')
dotenv.config()

const {isLoggedIn,isNotLoggedIn} = require('../middlewares/index')

const {
  how_use,map,
    login,
    mypage,
    register,register2} = require('../controllers2/page')


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

router.get('/how_use',how_use)
router.get('/map',map)
router.get('/login',isNotLoggedIn,login)
router.get('/register',isNotLoggedIn,register)
router.get('/register2',isNotLoggedIn,register2)
router.get('/mypage',isLoggedIn,mypage)


module.exports = router