const Client = require("../models/clientModel");
const Barcode = require("../models/barcodeModel");

exports.addClient = async (req,res,next) => {
    try {
        console.log("body", req.body)
        const Client = await new Client(req.body);
        let result = await Client.save();
        res.status(201).send({ data: result, message: "save Client success" });
    } catch (e) {
        console.log("e", e)
        next(e)
    }
};

exports.updateClient = async (req,res,next) => {
    try {
        const updateClient = req.body;
        let {clientId} = updateClient
        //Find client and update
        let client = await Client.findByIdAndUpdate({_id: clientId}, updateClient);
        //Can not find the client, send error to client
        if(!client){
            res.status(201).send({ status: "fail", message: "Can't update this client" });
        }

        res.status(201).send({ data: client, message: "Update Client success" });
    } catch (e) {
        console.log("error when update client", e)
        res.status(500).send({ status: "fail", message: e });
        next(e)
    }
};

/*exports.getClient = async (req,res,next) => {
    try {
        let id = req.query.id;
        let result
        if(!id){
            result = await Client.find({});
            res.status(201).send({n: result.length, data: result, message: "Get all Client success" });
        } else {
            result = await Client.findById({_id: id})
            if(result){
                res.status(201).send({data: result, message: "Get Client success" });
            } else {
                res.status(404).send({status: 'fail', message: "Get Client error" });
            }
        }


    } catch (e) {
        console.log("error when find client", e)
        res.status(500).send({ status: "fail", message: e });
        next(e)
    }
};*/

exports.deleteClient = async (req,res,next) => {
    try {
        let id = req.query.id;
        let client = await Client.findByIdAndDelete({_id: id});
        if(client){
            res.status(201).send({ data: client, message: "Delete Client success" });
        } else {
            res.status(404).send({status: 'fail', message: "Can not find and delete this client" });
        }

    } catch (e) {
        console.log("error when find client", e)
        res.status(500).send({ status: "fail", message: e });
        next(e)
    }
};

//Search client
exports.searchClient = async (req, res, next) => {
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
            let client = await Client.findById({ _id: get }).populate({
                path: "client",
                select: "_id email customClientId clientName",
            });
            console.log("barcode", client);
            res.status(200).send({ data: client });
        }
        switch (filter) {
            case "all":
                let result = await Client.aggregate(pipeline);
                data = result[0];
                break;
            case "clientName":
                console.log("2");
                key = key.toLowerCase();
                data = await Client.find({ clientName: key });
                if (data.length === 0) {
                    let allData = await Client.find();
                    data = allData.filter((item) => item.clientName.includes(key));
                }
                break;
            case "customClientId":
                //key = key.toLowerCase();
                data = await Client.find({ customClientId: key });
                break;
            case "email":
                data = await Client.find({ email: key });
                console.log("4");
                break;
            default:
                console.log("defaul");
                break;
        }
        console.log("6");
        res.status(200).send({ data});
    } catch (e) {
        console.log("e", e);
        res.status(500).send({ status: "fail", error: e });
        next(e);
    }
};
