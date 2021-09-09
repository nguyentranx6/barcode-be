const Ulti = require("../shared/ulti");
const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')
const Barcode = require("../models/barcodeModel");


const url = "https://secure.mite.pay360.com/hosted/b/barCodeImgShort?code=4YnZM7R0mYigQufPHB-F1zDEB2gG1_JhqRWyGZydpQ4="

exports.downloadImg = async (req, res, next) => {
    try {
        let id = req.query.id;
      let result = await Barcode.findById({_id: id})
        if(result){
           return  res.send({result})
        }
        console.log("tessssss", )

    } catch (e) {
        console.log("error when create barcode", e);
        res.status(500).send({ status: "fail", error: e });
        next(e);
    }
};
