const mongoose = require("mongoose");

const barcodeSchema = new mongoose.Schema(
  {
      name: {
          type: String,
          trim: true,
          default: ''
      },
      email: {
          type: String,
          trim: true,
          lowercase: true,
          default: ''
      },
      url: {
          type: String,
          trim: true,
          required: true
      },
      price: {
          type: Number,
          trim: true
      },
      transactionId: {
          type: String,
          trim: true,
          default: ''
      },
      receivedTime: {
          type: Date,
          default: null
      },
      status: {
          type: String,
          enum: ["pending", "complete", "fail"],
          default: 'pending'
      },
      transactionTime: {
          type: Date,
          trim: true
      }
  },
  {
    timestamps: true,
  }
);

const Barcode = mongoose.model("Barcode", barcodeSchema);
module.exports = Barcode;
