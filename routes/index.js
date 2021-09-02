var express = require('express');
var router = express.Router();
const receiveCallBack = require("../controllers/receive-callback");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('http://185.151.51.150:4200/');
});


/* Receive Callback */
router.post('/merchant/callback', receiveCallBack.receiveCallBack);
router.get('/merchant/callback', receiveCallBack.receiveCallBack);

module.exports = router;
