const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.addNewUser = async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ data: user, token });
  } catch (e) {
    next(e);
  }
};

exports.userLogin = async (req, res, next) => {
  try {
    const user = await User.findByCredential(req.body.email, req.body.password);
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    next(e);
  }
};

exports.userLogout = async (req, res, next) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send({
      status: "Logout successful!",
    });
  } catch (e) {
    next(e);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    let updateUser = { ...req.body };
      console.log("updateusser", updateUser)
    let _id = updateUser._id;
    let user = await User.findOne({ _id });
    console.log("currentUser", user)

    if (updateUser.password) {
      updateUser.password = await bcrypt.hash(updateUser.password, 8);
    } else {
      updateUser.password = user.password;
    }
    const data = await User.findByIdAndUpdate({ _id }, updateUser, {
      new: false,
    });
    if (data) {
      res.status(200).send({
        status: "success",
        data,
      });
    } else {
        res.status(404).send({
            status: "fail",
            message: "Update user get error",
        });
    }
  } catch (e) {
      res.status(500).send({
          status: "fail",
          message: e,
      });
    next(e);
  }
};

exports.changePasswordUser = async (req, res, next) => {
  try {
    let { id, password } = req.body;
    let newPassword = await bcrypt.hash(password, 8);
    const data = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { password: newPassword } },
      { new: false }
    );
    res.send({
      status: "Update success",
      data,
    });
  } catch (e) {
    next(e);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    let _id = req.query.id;
    await User.findOneAndDelete({ _id: _id });
    res.send({
      status: "Delete success",
    });
  } catch (e) {
    next(e);
  }
};

exports.getUserDetail = async (req, res, next) => {
  try {
    let _id = req.query.id;
    let user;
    if (_id) {
      user = await User.findById({ _id });
    }
    if (user) {
      res.status(200).send({ status: "success", data: user });
    } else {
      res.status(400).send({
        status: "fail",
        message: `Cannot find this user with id: ${_id}`,
      });
    }
  } catch (e) {
    console.log("get user detail error");
    res.status(500).send({ status: "fail", error: e });
    next(e);
  }
};
