const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../middlewares/index');
const { campuslistfloorlistprocess, campuslistfloorlist, campuslistprocess,campuslist} = require('../controllers2/select');

router.use(express.static('therest'));

router.get(`/:campuslist`,isLoggedIn,campuslist)

router.post(`/:campuslist/process`,isLoggedIn,campuslistprocess)

router.get(`/:campuslist/:floorlist`,isLoggedIn,campuslistfloorlist)

router.post(`/:campuslist/:floorlist/process`,isLoggedIn,campuslistfloorlistprocess)

module.exports = router;