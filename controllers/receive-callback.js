const axios = require("axios");
const Ulti = require("../shared/ulti");
const Barcode = require("../models/barcodeModel");

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
    let status = data.transaction.status;
    let stage = data.transaction.stage;
    let transactionId = data.transaction.transactionId;
    let receivedTime = data.transaction.receivedTime;

    //Logging data
      console.log("Status", status);
      console.log("Stage", stage);

    setTimeout(async ()=>{
        if (status === "SUCCESS" && stage === "AUTHORISATION") {
            //Update status of transaction into database
            let item = await Barcode.findOneAndUpdate(
                { transactionId },
                {
                    $set: {
                        status: "complete",
                        receivedTime: receivedTime,
                    },
                }
            );
            //Logging status
            item ? console.log("Update success") : console.log("Update fail !!!");

            //Send email to notify success status
            let option = {
                mailTo: "vewaho5793@mnqlm.com",
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

            //Send email to notify fail status
            let option = {
                mailTo: "vewaho5793@mnqlm.com",
                subject: `Transaction failed - ${transactionId}`,
                text: `Transaction ${transactionId} had failed`,
            };
            /*await Ulti.sendEmail(option);*/
        }
    }, 20000)

    console.log("Complete");
  } catch (e) {
    console.log("error", e);
    next(e);
  }
};

exports.pushNotify = async (req, res, next) => {
  try {
    console.log("req", req);
  } catch (e) {}
};