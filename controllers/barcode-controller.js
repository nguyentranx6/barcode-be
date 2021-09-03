const axios = require('axios');
const config = require('../shared/config')
const Ulti = require('../shared/ulti')
const Barcode = require("../models/barcodeModel");


exports.saveNewBarcode = async (req,res,next) => {
    try {
            let newBarcode = new Barcode(req.body);
            let result = await newBarcode.save();
        console.log("save success",)
            res.status(200).send({status: "success",result})
    } catch (e) {
        res.status(500).send({status: "fail", error: e})
        next(e)
    }
};


exports.getBarcode = async (req, res, next) => {
    try {
        let price = req.query.price;
        console.log("Data", config.POST_DATA_BARCODE(price))
        let val = await axios.post(config.API_REQUEST_BARCODE, config.POST_DATA_BARCODE(price), {headers: config.HEADER_AUTHORIZATION});
        let urlImg = val.data.processing.payCashResponse.barcodeUrl;
        let img = await Ulti.getImgBarcode(urlImg)
        console.log("Created barcode success")
        res.status(201).send({data: val.data,img,
            message: "Success created barcode"})
    }
    catch (e) {
        console.log("e", e)
        res.status(500).send({status: "fail", error: e})
        next(e);
    }
}
// Get all barcode from database
exports.getAllBarcode = async (req,res,next) => {
    try {
        let newBarcode = await Barcode.find();

        res.status(200).send({data: newBarcode})
    } catch (e) {
        res.status(500).send({status: "fail", error: e})
        next(e)
    }
};

//Delete barcode
exports.deleteBarcode = async (req,res,next) => {
    try {
        let {_id} = req.query;
        console.log("id", _id);
        let result = await Barcode.findByIdAndDelete({_id})
        if(result){
            res.status(200).send({message: "Delete Success!", status: "success"})
        } else {
            res.status(404).send({message: "Error !!!, Can not find this item", status: "fail"})
        }
    } catch (e) {
        next(e)
    }
};

//Check invoice number is exist
exports.checkInvoiceNumber = async (req,res,next) => {
    try {
        let {invoice} = req.query;
        console.log("invoice", invoice)

        let result = await Barcode.find({invoiceNumber: invoice});
        console.log("result", result)
        if(result.length>0){
            res.status(200).send({status: "fail",message: "This invoice is exist!"})
        } else  {
            res.status(404).send({status: "success", message: "This invoice is not exist!"})
        }


    } catch (e) {
        console.log("e", e)
        res.status(500).send({status: "fail", error: e})
        next(e)
    }
};

//Check invoice number is exist
exports.searchBarcode = async (req,res,next) => {
    try {
        let {key} = req.query;
        console.log("key", key)

        let result = await Barcode.find({invoiceNumber: invoice});
        console.log("result", result)
        if(result.length>0){
            res.status(200).send({status: "fail",message: "This invoice is exist!"})
        } else  {
            res.status(404).send({status: "success", message: "This invoice is not exist!"})
        }


    } catch (e) {
        console.log("e", e)
        res.status(500).send({status: "fail", error: e})
        next(e)
    }
};
