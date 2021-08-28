var express = require('express');
var router = express.Router();
const controller = require('../controllers/barcode')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/* Get barcode */
router.get('/api/barcode', controller.getBarcode);

/* Get Img Barcode */
//router.get('/api/img-barcode', controller.getImgBarcode);

module.exports = router;
