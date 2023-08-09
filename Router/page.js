const express = require('express');
const router = express.Router();

const {isLoggedIn,isNotLoggedIn} = require('../middlewares/index')

const {home,how_use,map,login,mypage,register} = require('../controllers2/page')

router.use(express.static('therest'));

router.get('/',isLoggedIn,home)
router.get('/how_use',isLoggedIn,how_use)
router.get('/map',isLoggedIn,map)
router.get('/login',isNotLoggedIn,login)
router.get('/register',isNotLoggedIn,register)
router.get('/mypage',isLoggedIn,mypage)


module.exports = router