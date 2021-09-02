const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'User password required'],
            trim: true,
        },
        password: {
            type: String,
            trim: true,
            required: [true, 'User password required'],
        },
        email: {
            type: String,
            required: [true, 'User email required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

userSchema.methods.toJSON = function () {
    const user = this;
    const UserObject = user.toObject();
    delete UserObject.password;
    delete UserObject.tokens;
    delete UserObject.createdAt;
    delete UserObject.updatedAt;
    delete UserObject.__v;
    return UserObject;
};

userSchema.statics.findByCredential = async function (email, password) {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Unable to login");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Unable to login");
    }
    return user;
};

userSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
