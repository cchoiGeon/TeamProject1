const express = require('express');
const router = express.Router();

const {isLoggedIn} = require('../middlewares/index');
const { home, report, reportprocess } = require('../controllers2/report');

router.use(express.static('therest'));

router.get("/",isLoggedIn,home)

router.get(`/:campuslist`,isLoggedIn,report)

router.post(`/:campuslist/process`,isLoggedIn,reportprocess)

module.exports = router;