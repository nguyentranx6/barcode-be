const axios = require("axios");
const Ulti = require("../shared/ulti");
const Barcode = require("../models/barcodeModel");
const Notify = require("../models/notifyModel");

exports.receiveCallBack = async (req, res, next) => {
  try {
      console.log("Data is coming");
    //Send response to pay360 confirm
    res.status(200).send({
      callbackResponse: {
        preAuthCallbackResponse: {
          action: "PROCEED",
        },
      },
    });

    //create data to save into database and send email;
    let data = req.body;
      console.log("Data", data)
    let status = data.transaction.status;
    let stage = data.transaction.stage;
    let transactionId = data.transaction.transactionId;
    let receivedTime = data.transaction.receivedTime;
    let barcodeNumber = data.processing.payCashResponse.barcode;
    let expiryDays = data.processing.payCashResponse.expiryDays;

    if(!barcodeNumber){
        console.log("barcodeNumber not exist!");
        res.status(500).send({status: 'fail', message: "barcodeNumber not exist!"})
    }
    //Logging data
      console.log("Status", status);
      console.log("Stage", stage);

    setTimeout(async ()=>{
        if (barcodeNumber) {
            //Update status of transaction into database
            console.log("transctionID", transactionId)
            let item = await Barcode.findOneAndUpdate(
                { transactionId },
                {
                    $set: {
                        status: "paid",
                        receivedTime: receivedTime,
                        transactionId: transactionId,
                        expiryDays: expiryDays,
                    },
                }
            );
            console.log("itemUpdate", item)
            //Logging status update barcode
            item ? console.log("Update success") : console.log("Update fail !!!");
            if(!item){
                return;
            }
            //Update status to notify collection
            let barcodeId = item._id;
            let newNotify = await new Notify({barcodeId});
            let resultSaveNotify = await newNotify.save();
            //Logging status save notify
            resultSaveNotify ? console.log("Create notify success") : console.log("Create notify fail !!!");

            //Logging status
            item ? console.log("Update success") : console.log("Update fail !!!");

            //Send email to notify success status
            let option = {
                mailTo: "binahol611@enamelme.com",
                subject: `Transaction complete - ${transactionId}`,
                text: `Transaction ${transactionId} had completed`,
            };
            /*await Ulti.sendEmail(option);*/

        } else {
            //Update database fail status
            let item = await Barcode.findOneAndUpdate(
                { transactionId },
                {
                    $set: {
                        status: "fail",
                        receivedTime: receivedTime,
                    },
                }
            );
            //Logging status
            item
                ? console.log("Update fail status success")
                : console.log("Update fail status fail !!!");

            if(!item){
                return;
            }

            //Send email to notify fail status
            let option = {
                mailTo: "binahol611@enamelme.com",
                subject: `Transaction failed - ${transactionId}`,
                text: `Transaction ${transactionId} had failed`,
            };
            /*await Ulti.sendEmail(option);*/
        }
    }, 6000)

    console.log("Complete");
  } catch (e) {
    console.log("error", e);
    res.status(500).send({status: 'fail', message: e})
    next(e);
  }
};

exports.pushNotify = async (req, res, next) => {
  try {
    console.log("req", req);
  } catch (e) {}
};
