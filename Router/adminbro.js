const express = require('express');
const router = express.Router();
const {
  adminbro,adminbro_process,
  adminbro_report,adminbro_report_process,
  adminbro_user,adminbro_user_process,
  adminbro_img,} = require('../controllers2/adminbro')


router.get('/',adminbro)
router.post('/process',adminbro_process)

router.get('/report',adminbro_report)
router.post('report/process',adminbro_report_process)  

router.get('/user',adminbro_user)
router.post('/user/process',adminbro_user_process)

router.get('/img/:id',adminbro_img)

module.exports = router