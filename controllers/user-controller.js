
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.addNewUser = async (req,res,next) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ data: user, token });
    } catch (e) {
        next(e)
    }
};

exports.userLogin = async (req,res,next) => {
    try {
        const user = await User.findByCredential(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.send({ user, token});
    } catch (e) {
        next(e)
    }
};

exports.userLogout = async (req,res,next) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send({
            status: "Logout successful!",
        });
    } catch (e) {
        next(e)
    }
};

exports.updateUser = async (req,res,next) => {
    try {
        let updateUser = {...req.body.updateUser};
        let id = req.body.id;
        let user = await User.findOne({_id: id})

        if(updateUser.password){
            updateUser.password = await bcrypt.hash(
                req.body.updateUser.password,
                8
            );
        } else {
            updateUser.password = user.password;
        }
        const data = await User.findByIdAndUpdate({_id: id},updateUser,{new:false})
        res.send({
            status: "Update success",
            data
        });
    } catch (e) {
        next(e)
    }
};

exports.changePasswordUser = async (req,res,next) => {
    try {
        let {id,password} = req.body;
        let newPassword = await bcrypt.hash(
            password,
            8
        );
        const data = await User.findByIdAndUpdate({_id: id},{$set: {'password': newPassword}},{new:false})
        res.send({
            status: "Update success",
            data
        });
    } catch (e) {
        next(e)
    }
};

exports.deleteUser = async (req,res,next) => {
    try {
        let _id = req.query.id
        await User.findOneAndDelete({_id: _id})
        res.send({
            status: "Delete success",
        });
    } catch (e) {
        next(e)
    }
};

exports.getUserDetail = async (req,res,next) => {
    try {
        let _id = req.query.id
        let user = await User.findById({_id})
        res.send({
            data: user,
        });
    } catch (e) {
        next(e)
    }
};
