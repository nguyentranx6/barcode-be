const mongoose = require("mongoose");

const notifySchema = new mongoose.Schema(
    {
        barcodeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Barcode'
        },
        status: {
            type: String,
            enum: ["read", "unread"],
            default: 'unread',
        },
    },
    {
        timestamps: true,
    }
);

const Notify = mongoose.model("Notify", notifySchema);
module.exports = Notify;
