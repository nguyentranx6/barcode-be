
const config = require('../shared/config')
const Ulti = require('../shared/ulti')
const Notify = require("../models/notifyModel");
const Barcode = require("../models/barcodeModel");
const {ObjectId} = require("mongodb");
const Client = require("../models/clientModel");

//Request to database to get new barcode had paid
exports.getNotify = async (req,res,next) => {
    try {
        let type = req.query.type;
        let pipeline;
        //If request all
        if(type ==='all'){
            pipeline = [
                {
                    $lookup: {
                        from: Barcode.collection.name,
                        localField: "barcodeId",
                        foreignField: "_id",
                        as: "barcodeInfo",
                    }
                },
                {
                    $unwind: "$barcodeInfo"
                },
                {
                    $project: {
                        _id: "$_id",
                        barcodeId: "$barcodeId",
                        status: "$status",
                        transactionStatus: "$barcodeInfo.status",
                        transactionId: "$barcodeInfo.transactionId",
                        receivedTime: "$barcodeInfo.receivedTime",
                        clientName: "$barcodeInfo.clientName",
                        barcodeNumber: "$barcodeInfo.barcodeNumber",
                        relatedTransaction: "$barcodeInfo.relatedTransaction",
                        clientId: "$barcodeInfo.clientId",
                        email: "$barcodeInfo.email",
                        invoiceNumber: "$barcodeInfo.invoiceNumber",
                        url: "$barcodeInfo.url",
                        price: "$barcodeInfo.price",
                        transactionTime: "$barcodeInfo.transactionTime",
                    }
                },{
                $sort: {transactionTime: -1}
                }
            ]
        }
        //If request new notify
        else if(type ==='new'){
            pipeline = [
                {
                    $match: {
                        status: 'unread'
                    }
                },
                {
                    $lookup: {
                        from: Barcode.collection.name,
                        localField: "barcodeId",
                        foreignField: "_id",
                        as: "barcodeInfo",
                    }
                },
                {
                    $unwind: "$barcodeInfo"
                },
                {
                    $project: {
                        _id: "$_id",
                        barcodeId: "$barcodeId",
                        status: "$status",
                        transactionId: "$barcodeInfo.transactionId",
                        receivedTime: "$barcodeInfo.receivedTime",
                        clientName: "$barcodeInfo.clientName",
                        invoiceNumber: "$barcodeInfo.invoiceNumber",
                        url: "$barcodeInfo.url",
                        price: "$barcodeInfo.price",
                        transactionTime: "$barcodeInfo.transactionTime",
                    }
                }
            ]
        }
        let result = await Notify.aggregate(pipeline)

        if(result.length>0){
            res.status(200).send({n: result.length,data: result})
        } else {
            res.status(200).send({n: 0, data: result})
        }
    } catch (e) {
        res.status(500).send({status: "fail", error: e})
        next(e)
    }
};


//Update status when client had viewed notify
exports.updateStatusNotify = async (req,res,next) => {
    try {
        let id = req.query.id;
        let result = await Notify.findByIdAndUpdate({_id: id},{
            $set: {status: "read"}
        })
        if(result){
            res.status(200).send({status: "Update success",result})
        } else {
            res.status(404).send({status: "Update fail"})
        }

    } catch (e) {
        res.status(500).send({status: "fail", error: e})
        next(e)
    }
};

//Delete all notify
exports.deleteNotify = async (req,res,next) => {
    try {
        let id = req.query.id;
        await Notify.findByIdAndDelete({_id: id})
        res.status(200).send({status: "Delete success"})
    } catch (e) {
        res.status(500).send({status: "fail", error: e})
        next(e)
    }
};

//Update status when client had viewed notify
exports.updateStatusNotifyAfterRead = async (req,res,next) => {
    try {
        let data = req.body;
        console.log("data", data)
        if(data.length>0 && data){
            for (let i = 0; i < data.length; i++) {
                let item = data[i];
                await Notify.findByIdAndUpdate({_id: item._id },{
                    $set: {status: "read"}
                })
            }
            res.status(200).send({status: "Update success"})
        }

        res.status(404).send({status: "Update fail"})

    } catch (e) {
        res.status(500).send({status: "fail", error: e})
        next(e)
    }
};

//Get all or new notify and pagination
exports.searchNotify = async (req, res, next) => {
    try {
        let { filter, size, page, order, action} = req.query;
        page = parseInt(page);
        size = parseInt(size);
        filter = filter.toLowerCase();
        console.log("page", page);
        console.log("size", size);
        let data;
        //Create pipeline and mat condition
        let pipeline;
        let matchObj;
        //Switch case: all or new fitler
        switch (filter) {
            case "all":
                console.log("all");
                matchObj = {};
                break;
            case "new":
                //Assign to matchObj
                matchObj = { status: 'unread' };
                break;
            default:
                break;
        }
        pipeline = [
            {
                $facet: {
                    data: [
                        { $match: matchObj },
                        { $sort: { updatedAt: -1 } },
                        { $skip: page },
                        { $limit: size },
                        {
                            $lookup: {
                                from: Barcode.collection.name,
                                localField: "barcodeId",
                                foreignField: "_id",
                                as: "barcodeInfo",
                            }
                        },
                        {
                            $unwind: "$barcodeInfo"
                        },
                        {
                            $project: {
                                _id: "$_id",
                                barcodeId: "$barcodeId",
                                status: "$status",
                                updatedAt: "$updatedAt",
                                barcodeNumber: "$barcodeInfo.barcodeNumber",
                            }
                        },
                        { $sort: { updatedAt: -1 } },
                    ],
                    totalCount: [{ $match: matchObj }, { $count: "count" }],
                },
            },
        ];
        data = await Notify.aggregate(pipeline);
        res.status(200).send({ data: data[0] });

        //After send new notify, update status unread --> read
        if(action ==='update'){
            let notifyUpdate = await Notify.updateMany({status: 'unread'},{status:'read'});
            if(notifyUpdate){
                console.log("Update status read success",)
            } else {
                res.status(500).send({ status: "fail", error: e , message: "update status read fail"});
            }
        }
    } catch (e) {
        console.log("e", e);
        res.status(500).send({ status: "fail", error: e });
        next(e);
    }
};


