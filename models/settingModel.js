const mongoose = require("mongoose");


const settingSchema = new mongoose.Schema({
    _immutable: {
        type: Boolean,
        default: true,
        required: true,
        unique: true,
        immutable: true
    },
    mailServe: {
        userEmail: {
            type: String,
            required: true,
        },
        appPass: {
            type: String,
            required: true,
        },
        receiveEmail: [{
            type: String,
            required: true,
        }],

    },
    api360: {
        apiUser: {type: String, required: true},
        apiPassword: {type: String, required: true},
        apiCardLockId: {type: String, required: true},
        apiInst: {type: String, required: true},
    }
})

settingSchema.methods.toJSON = function () {
    const setting = this;
    const UserObject = setting.toObject();
    delete UserObject._id;
    delete UserObject.__v;
    delete UserObject._immutable;
    return UserObject;
};

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;
