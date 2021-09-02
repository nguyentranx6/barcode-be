const express = require("express");
const settingRouters = express.Router();
const auth = require("../middlewares/auth");
const settingControllers = require("../controllers/setting-controller");


settingRouters
    .route("/")
    .post(settingControllers.addSetting)
    .put( settingControllers.updateSetting)
    .delete(settingControllers.deleteSetting)
    .get(settingControllers.getSetting);


module.exports = settingRouters;
