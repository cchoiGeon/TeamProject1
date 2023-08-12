const express = require('express');
const router = express.Router();
const {isLoggedIn,isNotLoggedIn} = require('../middlewares/index')
const {login_process,logout,register_process,register2_process} = require('../controllers2/auth');


router.use(express.static('uploads'));

router.post('/login/process',isNotLoggedIn,login_process)
router.get('/logout/process',isLoggedIn,logout)
router.post('/register/process',isNotLoggedIn,register_process)

module.exports = router