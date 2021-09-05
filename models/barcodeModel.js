const mongoose = require("mongoose");

const barcodeSchema = new mongoose.Schema(
  {
      clientName: {
          type: String,
          trim: true,
          lowercase: true,
          text: true
      },
      invoiceNumber: {
          type: String,
          trim: true,
          text: true,
         //lowercase: true,
      },
      email: {
          type: String,
          trim: true,
          lowercase: true,
          default: '',
          text: true
      },
      clientId: {
          type: String,
          trim: true,
          lowercase: true,
          text: true
      },
      url: {
          type: String,
          trim: true,
          required: true,
          text: true
      },
      price: {
          type: Number,
          trim: true
      },
      relatedTransaction: {
          type: String,
          trim: true,
          default: '',
          text: true
      },
      transactionId: {
          type: String,
          trim: true,
          default: '',
          text: true
      },
      barcodeNumber: {
          type: String,
          trim: true,
          text: true
      },
      receivedTime: {
          type: Date,
          default: null,
          text: true
      },
      status: {
          type: String,
          enum: ["pending", "paid", "fail"],
          default: 'pending',
          text: true
      },
      transactionTime: {
          type: Date,
          trim: true,
          text: true
      }
  },
  {
    timestamps: true,
  }
);

const Barcode = mongoose.model("Barcode", barcodeSchema);
module.exports = Barcode;
