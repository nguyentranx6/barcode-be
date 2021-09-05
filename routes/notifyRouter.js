const express = require("express");
const notifyRouters = express.Router();
const auth = require("../middlewares/auth");
const notifyControllers = require("../controllers/notify-controller");


notifyRouters
    .route("/")
    .post(notifyControllers.updateStatusNotify)
    .get(notifyControllers.getNotify)
    .put(notifyControllers.updateStatusNotifyAfterRead)
    .delete(notifyControllers.deleteNotify);


module.exports = notifyRouters;
