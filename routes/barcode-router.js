const express = require("express");
const barcodeRouter = express.Router();
const auth = require("../middlewares/auth");
const barcodeController = require("../controllers/barcode-controller");


//Check invoice number
barcodeRouter.route("/check").get(barcodeController.checkInvoiceNumber);

//Search
barcodeRouter.route("/search").get(barcodeController.searchBarcode);

barcodeRouter
  .route("/")
  .get(barcodeController.getAllBarcode)
  .post(barcodeController.generateBarcode)
  .delete(barcodeController.deleteBarcode);

module.exports = barcodeRouter;
