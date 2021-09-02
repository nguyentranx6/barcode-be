const express = require("express");
const barcodeRouter = express.Router();
const auth = require("../middlewares/auth");
const barcodeController = require("../controllers/barcode-controller");

//Get all barcode
barcodeRouter.route("/all").get(barcodeController.getAllBarcode);

barcodeRouter
  .route("/")
  .get(barcodeController.getBarcode)
  .post(barcodeController.saveNewBarcode)
  .delete(barcodeController.deleteBarcode);

module.exports = barcodeRouter;
