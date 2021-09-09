const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
    {
        customClientId: {
            type: String,
            lowercase: true,
            trim: true,
            unique: true
        },
        clientName: {
            type: String,
            lowercase: true,
            trim: true
        },
        email: {
            type: String,
            lowercase: true,
            trim: true
        },
    },
    {
        timestamps: true,
    }
);
clientSchema.methods.toJSON = function () {
    const client = this;
    const ClientObject = client.toObject();
    delete ClientObject.updatedAt;
    delete ClientObject.__v;
    return ClientObject;
};

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
