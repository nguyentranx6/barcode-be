const axios = require("axios");
const config = require("../shared/config");
const Ulti = require("../shared/ulti");
const Barcode = require("../models/barcodeModel");
const Client = require("../models/clientModel");
const { ObjectId } = require("mongodb");

//Call to Pay360 API to create barcode link and img barcode
exports.generateBarcode = async (req, res, next) => {
  try {
    console.log("req.body.data", req.body);
    //Get data from client
    let { clientName, invoiceNumber, price, email, customClientId } = req.body;

    //Create user
    let newClientData = { clientName, email, customClientId };
    let clientId;

    //Check user is exist
    let isExistUser = await Client.find({ customClientId });
    console.log("isExistUser", isExistUser);
    if (isExistUser.length > 0) {
      clientId = isExistUser[0]._id;
      console.log("exist", clientId);
      console.log("Client is exist");
    } else {
      let newClientCreate = await new Client(newClientData);
      let newClient = await newClientCreate.save();
      if (!newClient) {
       return  res.send({ status: "fail", message: "Create new client get error!" });
      }
      //Logging
      console.log("Create client success !", newClient);
      clientId = newClient._id;
      console.log("else clientID", clientId);
    }

    if (!price) {
      return res.send({ status: "fail", message: "Please input price!" });
    }
    //Use axios to call 360API
    let val = await axios.post(
      config.API_REQUEST_BARCODE,
      config.POST_DATA_BARCODE(price),
      { headers: config.HEADER_AUTHORIZATION }
    );
    console.log("value First time callback", val.data);
    //If get error send error to client
    if (!val) {
     return  res
        .status(500)
        .send({ status: "fail", error: "It get error when call 360API" });
    }

    //Check status of create barcode
    let status = val.data.transaction.status;
    if (status !== "SUCCESS") {
     return  res.status(500).send({ status: "fail", error: "Generate barcode fail" });
    }

    //Get data from 360API
    let url = val.data.processing.payCashResponse.barcodeUrl;
    let barcodeNumber = val.data.processing.payCashResponse.barcode;
    let transactionTime = val.data.transaction.transactionTime;
    let transactionId = val.data.transaction.transactionId;

    //Use Axios to get Img of barcode
    let imgBarcodeUrl = await Ulti.getImgBarcode(url);
    if (!imgBarcodeUrl) {
     return  res.status(500).send({
        status: "fail",
        error: "It get error when call get Image of barcode",
      });
    }

    //Download Barcode IMG
    if (imgBarcodeUrl && barcodeNumber) {
      await Ulti.downloadImg(imgBarcodeUrl, `${barcodeNumber}.jpg`);
    }

    //Logging status
    console.log("Created barcode success");

    //Create new barcode item to save to database
    let newBarcodeData = {
      url,
      barcodeNumber,
      transactionTime,
      transactionId,
      imgBarcodeUrl,
      price,
      invoiceNumber,
      clientId,
    };

    //Save barcode to database
    let newBarcode = await new Barcode(newBarcodeData);
    let result = await newBarcode.save();

    if (!result) {
      res
        .status(500)
        .send({ status: "fail", message: "Save barcode get error" });
    }
    console.log("result", result)
    //Send to client if success
    res.status(201).send({
      status: "success",
      data: result,
      message: "Success created barcode",
    });
  } catch (e) {
    console.log("error when create barcode", e);
    res.status(500).send({ status: "fail", error: e });
    next(e);
  }
};

//Call to Pay360 API to create barcode link and img barcode
exports.addOtherBarcodeWhenExpired = async (req, res, next) => {
  try {
    console.log("req.body.data", req.body);
    //Get data from client
    let { price, barcodeId } = req.body;

    //Check barcode is exist
    let oldBarcode = await Barcode.findById({_id: barcodeId});
    //Check data before call API 360
    if (!price || !oldBarcode) {
      return res.send({ status: "fail", message: "Please input price or This barcode not exist!" });
    }

    //Old transaction
    let oldTransaction = {
      barcodeNumber: oldBarcode.barcodeNumber,
      url: oldBarcode.url,
      transactionTime: oldBarcode.transactionTime,
      transactionId: oldBarcode.transactionId,
      price: oldBarcode.price,
    }
    //Use axios to call 360API
    let val = await axios.post(
        config.API_REQUEST_BARCODE,
        config.POST_DATA_BARCODE(price),
        { headers: config.HEADER_AUTHORIZATION }
    );
    console.log("value First time callback", val.data);
    //If get error send error to client
    if (!val) {
     return  res
          .status(500)
          .send({ status: "fail", error: "It get error when call 360API" });
    }

    //Check status of create barcode
    let status = val.data.transaction.status;
    if (status !== "SUCCESS") {
      return res.status(500).send({ status: "fail", error: "Generate barcode fail" });
    }

    //Get data from 360API
    let url = val.data.processing.payCashResponse.barcodeUrl;
    let barcodeNumber = val.data.processing.payCashResponse.barcode;
    let transactionTime = val.data.transaction.transactionTime;
    let transactionId = val.data.transaction.transactionId;

    //Use Axios to get Img of barcode
    let imgBarcodeUrl = await Ulti.getImgBarcode(url);
    if (!imgBarcodeUrl) {
     return  res.status(500).send({
        status: "fail",
        error: "It get error when call get Image of barcode",
      });
    }

    //Download Barcode IMG
    if (imgBarcodeUrl && barcodeNumber) {
      await Ulti.downloadImg(imgBarcodeUrl, `${barcodeNumber}.jpg`);
    }

    //Logging status
    console.log("Created barcode success");

    //Create barcode update item to save to database
    let barcodeUpdateData = {
      url,
      barcodeNumber,
      transactionTime,
      transactionId,
      imgBarcodeUrl,
      price,
    };

    //Updata barcode , Push history old transaction
    let updateHistoryBarcode = await Barcode.findByIdAndUpdate({_id: barcodeId},{
     $push: {"history": oldTransaction},
      $set: {
        url,
        barcodeNumber,
        transactionTime,
        transactionId,
        imgBarcodeUrl,
        price,
      }
    })
    console.log("updateHistoryBarcode",updateHistoryBarcode )


    if (!updateHistoryBarcode) {
      res
          .status(500)
          .send({ status: "fail", message: "Update barcode get error" });
    }

    //Send to client if success
    res.status(201).send({
      status: "success",
      data: updateHistoryBarcode,
      message: "Success created barcode",
    });
  } catch (e) {
    console.log("error when create barcode", e);
    res.status(500).send({ status: "fail", error: e });
    next(e);
  }
};


// Get all barcode from database
exports.getAllBarcode = async (req, res, next) => {
  try {
    let newBarcode = await Barcode.find();
    res.status(200).send({ data: newBarcode });
  } catch (e) {
    res.status(500).send({ status: "fail", error: e });
    next(e);
  }
};

//Delete barcode
exports.deleteBarcode = async (req, res, next) => {
  try {
    let { _id } = req.query;
    console.log("id", _id);
    let result = await Barcode.findByIdAndDelete({ _id });
    if (result) {
      res.status(200).send({ message: "Delete Success!", status: "success" });
    } else {
      res
        .status(404)
        .send({ message: "Error !!!, Can not find this item", status: "fail" });
    }
  } catch (e) {
    next(e);
  }
};

//Check invoice number is exist
exports.checkInputInfo = async (req, res, next) => {
  try {
    //Get query param
    let { invoice, clientid } = req.query;
    //If query is check invoice number
    if (invoice) {
      invoice = invoice.toLowerCase();
      console.log("invoice", invoice);
      let result = await Barcode.find({ invoiceNumber: invoice });
      console.log("result", result);
      if (result.length > 0) {
        res
          .status(200)
          .send({ status: "fail", message: "This invoice is exist!" });
      } else {
        res
          .status(200)
          .send({ status: "success", message: "This invoice is not exist!" });
      }
    } else if (clientid) {
      //If query is check Client ID
      clientid = clientid.toLowerCase();
      let client = await Client.find({ customClientId: clientid });
      if (client.length > 0) {
        res.status(200).send({
          status: "fail",
          message: "This Client ID is exist!",
          client: client[0],
        });
      } else {
        res
          .status(200)
          .send({ status: "success", message: "This Client ID is not exist!" });
      }
    }
  } catch (e) {
    console.log("error when check client ID", e);
    res.status(500).send({
      status: "fail",
      error: e,
      message: "Error when check client ID is exist",
    });
    next(e);
  }
};

//Check invoice number is exist
exports.searchBarcode = async (req, res, next) => {
  try {
    let {id, key, filter, size, page, sort, order  } = req.query;
    page = parseInt(page);
    size = parseInt(size);
    order = parseInt(order);
    key = key.toLowerCase();

    //Skip
    let skip;
    if(page ===0){
      skip =0
    } else {
      skip = (page - 1) * size;
    }
    //FOr sort
    let sortObj = {};
    sortObj[sort] = order;
    let data;

    //Create pipeline and mat condition
    let pipeline;
    let matchObj ={};

      //If get it mean query by barcode ID
      if(id){
        matchObj = {_id: ObjectId(id)}
      } else {
        switch (filter) {
          case "all":
            console.log("all");
            matchObj = {};
            break;
          case "barcodeId":
            console.log("barcodeid");
            matchObj = {_id: ObjectId(key)};
            break;
          case "clientId":
            console.log("clientId", key);
            matchObj = { clientId: ObjectId(key) };
            break;
          case "clientName":
            console.log("clientName", key);
            //First find on Client Collection
            let clients = await Client.find({ clientName: key });
            //If not found send fail
            if (clients.length === 0) {
              res.status(404).send({
                status: "fail",
                message: "Can not find this client name",
                data: clients
              });
            }
          {
            //If has result loop and put client ID
            let condition = [];
            clients.forEach((client) => {
              let item = { clientId: ObjectId(client._id) };
              condition.push(item);
            });
            //Assign to matchObj
            matchObj = { $or: condition };
          }
            break;
          case "customClientId":
            //First find on Client Collection
            let resultFindClientId = await Client.find({ customClientId: key });
            //If not found send fail
            if (resultFindClientId.length === 0) {
              res.status(404).send({
                status: "fail",
                message: "Can not find this client name",
              });
            }
          {
            //Assign to matchObj
            matchObj = { clientId: ObjectId(resultFindClientId[0]._id) };
          }
            break;
          case "invoiceNumber":
          case "url":
          case "transactionId":
          case "barcodeNumber":
            console.log("filter", filter);
            console.log("key", key)
            matchObj[filter] = key;
            break;
          default:
            break;
        }
      }

    pipeline = [
      {
        $facet: {
          data: [
            { $match: matchObj },
            { $sort: sortObj },
            { $skip: skip },
            { $limit: size },
            {
              $lookup: {
                from: Client.collection.name,
                localField: "clientId",
                foreignField: "_id",
                as: "client",
              },
            },
            {
              $unwind: "$client",
            },
          ],
          totalCount: [{ $match: matchObj }, { $count: "count" }],
        },
      },
    ];
    data = await Barcode.aggregate(pipeline);
    console.log("data", data)
    res.status(200).send({ data: data[0] });
  } catch (e) {
    console.log("e", e);
    res.status(500).send({ status: "fail", error: e });
    next(e);
  }
};
