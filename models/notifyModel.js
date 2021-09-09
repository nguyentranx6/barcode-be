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

notifySchema.methods.toJSON = function () {
    const notify = this;
    const NotifyObject = notify.toObject();
    delete NotifyObject.createdAt;
    delete NotifyObject.__v;
    return NotifyObject;
};

const Notify = mongoose.model("Notify", notifySchema);
module.exports = Notify;
