const Setting = require("../models/settingModel");

exports.addSetting = async (req,res,next) => {
    try {
        console.log("body", req.body)
        const setting = new Setting(req.body);
       let result = await setting.save();
        res.status(201).send({ data: result, message: "save setting success" });
    } catch (e) {
        console.log("e", e)
        next(e)
    }
};

exports.updateSetting = async (req,res,next) => {
    try {
        const {type,data} = req.body;
        let result;
        if(type==="mailServe"){
            result = await Setting.updateOne({},{
                mailServe: data
            },{upsert: true});
        } else if(type ==="api360"){
            result = await Setting.updateOne({},{
                api360: data
            },{upsert: true});
        }
        res.status(201).send({ data: result, message: "Update setting success" });
    } catch (e) {
        console.log("e", e)
        next(e)
    }
};

exports.getSetting = async (req,res,next) => {
    try {
        let result = await Setting.find({});
        res.status(201).send({ data: result, message: "Get setting success" });
    } catch (e) {
        next(e)
    }
};

exports.deleteSetting = async (req,res,next) => {
    try {
        let data = await Setting.remove({});
        res.status(201).send({ data, message: "Delete setting success" });
    } catch (e) {
        console.log("e", e)
        next(e)
    }
};
