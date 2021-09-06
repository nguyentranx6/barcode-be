const mongoose = require("mongoose");

const barcodeSchema = new mongoose.Schema(
  {
      invoiceNumber: {
          type: String,
          trim: true,
          text: true,
         //lowercase: true,
      },
      client: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Client'
      },
      url: {
          type: String,
          trim: true,
          required: true,
          text: true,
          lowercase: true,
      },
      price: {
          type: Number,
          trim: true
      },
      relatedTransaction: {
          type: String,
          trim: true,
          default: '',
          text: true,
          lowercase: true,
      },
      transactionId: {
          type: String,
          trim: true,
          default: '',
          text: true,
          lowercase: true,
      },
      barcodeNumber: {
          type: String,
          trim: true,
          text: true
      },
      imgBarcodeUrl: {
          type: String,
          trim: true,
          lowercase: true,
      },
      receivedTime: {
          type: Date,
          default: null,
      },
      status: {
          type: String,
          enum: ["pending", "paid", "fail"],
          default: 'pending',

      },
      transactionTime: {
          type: Date,
          trim: true,
      }
  },
  {
    timestamps: true,
  }
);
barcodeSchema.methods.toJSON = function () {
    const barcode = this;
    const BarcodeObject = barcode.toObject();
    delete BarcodeObject.__v;
    return BarcodeObject;
};
const Barcode = mongoose.model("Barcode", barcodeSchema);
module.exports = Barcode;
