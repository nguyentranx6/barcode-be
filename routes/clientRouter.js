const express = require("express");
const clientRouters = express.Router();
const auth = require("../middlewares/auth");
const clientControllers = require("../controllers/client-controller");

clientRouters.route('/search').get(clientControllers.searchClient);
clientRouters
    .route("/")
    .post(clientControllers.addClient)
    .put( clientControllers.updateClient)
    .delete(clientControllers.deleteClient)



module.exports = clientRouters;
