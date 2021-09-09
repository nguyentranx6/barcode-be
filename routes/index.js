var express = require('express');
var router = express.Router();
const receiveCallBack = require("../controllers/receive-callback");
const downloadImg = require("../controllers/downloadImg-controller");

/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.redirect('http://165.227.236.153:8888/');
});*/


/* Receive Callback */
router.post('/merchant/callback', receiveCallBack.receiveCallBack);
router.get('/merchant/callback', receiveCallBack.receiveCallBack);

/* Test download img*/
router.get('/download', downloadImg.downloadImg);

module.exports = router;
