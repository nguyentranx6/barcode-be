const Client = require("../models/clientModel");
const Barcode = require("../models/barcodeModel");
const { ObjectId } = require("mongodb");

exports.addClient = async (req, res, next) => {
  try {
    console.log("body", req.body);
    const Client = await new Client(req.body);
    let result = await Client.save();
    res.status(201).send({ data: result, message: "save Client success" });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const updateClient = req.body;
    let { clientId } = updateClient;
    //Find client and update
    let client = await Client.findByIdAndUpdate(
      { _id: clientId },
      updateClient
    );
    //Can not find the client, send error to client
    if (!client) {
      res
        .status(201)
        .send({ status: "fail", message: "Can't update this client" });
    }

    res.status(201).send({ data: client, message: "Update Client success" });
  } catch (e) {
    console.log("error when update client", e);
    res.status(500).send({ status: "fail", message: e });
    next(e);
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

exports.deleteClient = async (req, res, next) => {
  try {
    let id = req.query.id;
    let client = await Client.findByIdAndDelete({ _id: id });
    if (client) {
      res.status(201).send({ data: client, message: "Delete Client success" });
    } else {
      res
        .status(404)
        .send({
          status: "fail",
          message: "Can not find and delete this client",
        });
    }
  } catch (e) {
    console.log("error when find client", e);
    res.status(500).send({ status: "fail", message: e });
    next(e);
  }
};

//Search client
exports.searchClient = async (req, res, next) => {
  try {
    //Define data
    let data;
    //get Query
    let { id, key, filter, size, page, sort, order } = req.query;
    page = parseInt(page);
    size = parseInt(size);
    let skip;
      if(page ===0){
        skip =0
    } else {
        skip = (page - 1) * size;
    }

    order = parseInt(order);
    key = key.toLowerCase();


    //For sort
    let sortObj = {};
    sortObj[sort] = order;

    //For aggregate
    let pipeline;
    let matchObj = {};

    //Assign stage sort

    //Create pipeline and mat condition

    if (id) {
      matchObj = { _id: ObjectId(id) };
    } else {
      switch (filter) {
        case "all":
          console.log("all");
          matchObj = {};
          break;
        case "clientName":
        case "customClientId":
        case "email":
          matchObj[filter] = key;
          break;
        default:
          break;
      }
    }
    //Check if sort quantity and total bill
    if (sort === "quantity" || sort === "totalBill") {
      pipeline = [
        {
          $facet: {
            data: [
              { $match: matchObj },
              {
                $lookup: {
                  from: Barcode.collection.name,
                  localField: "_id",
                  foreignField: "clientId",
                  as: "barcode",
                },
              },
              {
                $project: {
                  clientName: 1,
                  email: 1,
                  customClientId: 1,
                  createdAt: 1,
                  barcode: 1,
                  quantity: { $size: "$barcode" },
                },
              },
              {
                $unwind: "$barcode",
              },
              {
                $group: {
                  _id: "$_id",
                  quantity: { $first: "$quantity" },
                  clientName: { $first: "$clientName" },
                  email: { $first: "$email" },
                  customClientId: { $first: "$customClientId" },
                  createdAt: { $first: "$createdAt" },
                  totalBill: { $sum: "$barcode.price" },
                },
              },
              { $sort: sortObj },
              { $skip: skip },
              { $limit: size },
            ],
            totalCount: [{ $match: matchObj }, { $count: "count" }],
          },
        },
      ];
    } else {
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
                  from: Barcode.collection.name,
                  localField: "_id",
                  foreignField: "clientId",
                  as: "barcode",
                },
              },
              {
                $project: {
                  clientName: 1,
                  email: 1,
                  customClientId: 1,
                  createdAt: 1,
                  barcode: 1,
                  quantity: { $size: "$barcode" },
                },
              },
              {
                $unwind: "$barcode",
              },
              {
                $group: {
                  _id: "$_id",
                  quantity: { $first: "$quantity" },
                  clientName: { $first: "$clientName" },
                  email: { $first: "$email" },
                  customClientId: { $first: "$customClientId" },
                  createdAt: { $first: "$createdAt" },
                  totalBill: { $sum: "$barcode.price" },
                },
              },
              { $sort: sortObj },
            ],
            totalCount: [{ $match: matchObj }, { $count: "count" }],
          },
        },
      ];
    }

    data = await Client.aggregate(pipeline);
    res.status(200).send({ data: data[0] });
  } catch (e) {
    console.log("e", e);
    res.status(500).send({ status: "fail", error: e });
    next(e);
  }
};
