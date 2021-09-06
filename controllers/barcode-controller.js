const axios = require("axios");
const config = require("../shared/config");
const Ulti = require("../shared/ulti");
const Barcode = require("../models/barcodeModel");
const Client = require("../models/clientModel");

//Save barcode to database and notify
/*exports.saveNewBarcode = async (req, res, next) => {
  try {
    //Create and save new barcode
      let payload = req.body;
      if(!payload){
        res.status(404).send({ status: "Save fail"});
        return;
      }
    let newBarcode = await new Barcode(payload);
    let result = await newBarcode.save();
    //Loggin save new barcode
    if(result){
        console.log("result", result);
        console.log("Save new barcode success");
    } else {
        console.log("Save new barcode fail",)
    }

    res.status(200).send({ status: "success", result });
  } catch (e) {
    res.status(500).send({ status: "fail", error: e });
    console.log("error when save barcode", e)
    next(e);
  }
};*/

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
    let isExistUser = await Client.find({
      $or: [{ customClientId }, { email }],
    });
    console.log("isExistUser", isExistUser);
    if (isExistUser.length > 0) {
      clientId = isExistUser._id;
      console.log("Client is exist");
    } else {
      let newClientCreate = await new Client(newClientData);
      let newClient = await newClientCreate.save();
      if (!newClient) {
        res.send({ status: "fail", message: "Create new client get error!" });
      }
      //Logging
      console.log("Create client success !");
      clientId = newClient._id;
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
    //If get error send error to client
    if (!val) {
      res
        .status(500)
        .send({ status: "fail", error: "It get error when call 360API" });
    }

    //Check status of create barcode
    let status = val.data.transaction.status;
    if (status !== "SUCCESS") {
      res.status(500).send({ status: "fail", error: "Generate barcode fail" });
    }

    //Get data from 360API
    let url = val.data.processing.payCashResponse.barcodeUrl;
    let barcodeNumber = val.data.processing.payCashResponse.barcode;
    let transactionTime = val.data.transaction.transactionTime;
    let relatedTransaction = val.data.transaction.transactionId;

    //Use Axios to get Img of barcode
    let imgBarcodeUrl = await Ulti.getImgBarcode(url);
    if (!imgBarcodeUrl) {
      res.status(500).send({
        status: "fail",
        error: "It get error when call get Image of barcode",
      });
    }

    //Logging status
    console.log("Created barcode success");

    //Create new barcode item to save to database
    let newBarcodeData = {
      url,
      barcodeNumber,
      transactionTime,
      relatedTransaction,
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
exports.checkInvoiceNumber = async (req, res, next) => {
  try {
    let { invoice } = req.query;

    if (!invoice) {
      return;
    }
    /*invoice = invoice.toLowerCase();*/
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
  } catch (e) {
    console.log("e", e);
    res.status(500).send({ status: "fail", error: e });
    next(e);
  }
};

//Check invoice number is exist
exports.searchBarcode = async (req, res, next) => {
  try {
    let { key, filter, size, page, order, get } = req.query;
    page = parseInt(page);
    size = parseInt(size);
    let data;
    let n;

    //Create pipeline
    let pipeline = [
      {
        $facet: {
          data: [
            { $match: {} },
            { $skip: page },
            { $limit: size },
            { $sort: { createdAt: -1 } },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    if (get) {
      console.log("get", get);
      let barcode = await Barcode.findById({ _id: get }).populate({
        path: "client",
        select: "_id email customClientId clientName",
      });
      console.log("barcode", barcode);
      res.status(200).send({ data: barcode });
    }
    switch (filter) {
      case "all":
        let result = await Barcode.aggregate(pipeline);
        data = result[0];
        break;
      case "clientName":
        console.log("2");
        key = key.toLowerCase();
        data = await Barcode.find({ clientName: key });
        if (data.length === 0) {
          let allData = await Barcode.find();
          data = allData.filter((item) => item.clientName.includes(key));
        }
        break;
      case "invoiceNumber":
        //key = key.toLowerCase();
        data = await Barcode.find({ invoiceNumber: key });
        break;
      case "url":
        data = await Barcode.find({ url: key });
        console.log("4");
        break;
      case "transactionId":
        console.log("5");
        data = await Barcode.find({ transactionId: key });
        break;
      case "barcodeNumber":
        console.log("5");
        data = await Barcode.find({ barcodeNumber: key });
        break;
      default:
        console.log("defaul");
        break;
    }
    console.log("6");
    res.status(200).send({ data, n });
  } catch (e) {
    console.log("e", e);
    res.status(500).send({ status: "fail", error: e });
    next(e);
  }
};
