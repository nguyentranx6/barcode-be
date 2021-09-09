const express = require("express");
const notifyRouters = express.Router();
const auth = require("../middlewares/auth");
const notifyControllers = require("../controllers/notify-controller");


//Search
notifyRouters.route("/search").get(notifyControllers.searchNotify)

notifyRouters
    .route("/")
    .post(notifyControllers.updateStatusNotify)
    .get(notifyControllers.getNotify)
    .put(notifyControllers.updateStatusNotifyAfterRead)
    .delete(notifyControllers.deleteNotify);


module.exports = notifyRouters;
