const mongoose = require("mongoose");

const barcodeSchema = new mongoose.Schema(
  {
      clientName: {
          type: String,
          trim: true,
      },
      invoiceNumber: {
          type: String,
          trim: true,
          unique: true
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
          enum: ["pending", "paid", "fail"],
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
