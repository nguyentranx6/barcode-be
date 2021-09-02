const express = require("express");
const userRouters = express.Router();
const auth = require("../middlewares/auth");
const userControllers = require("../controllers/user-controller");


userRouters
  .route("/")
  .post(userControllers.addNewUser)
  .put(auth, userControllers.updateUser)
  .delete(auth, userControllers.deleteUser);

userRouters.route('/login').post(userControllers.userLogin)

module.exports = userRouters;
