const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const bodyParser = require('body-parser');
const router = express.Router();
const dotenv = require('dotenv')
dotenv.config()


const {home} = require('../controllers2/home');

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

router.get('/',home)

module.exports = router