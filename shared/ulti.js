const fs = require('fs');
const path = require('path');
const nodemailer = require("nodemailer");
const config = require('./config')
const axios = require("axios");


const sendEmail = async (option = null) => {
    let transport = nodemailer.createTransport(config.NODEMAILER_CONFIG);
    let message = {
        from: '"Fred Foo 👻" <barcode360@example.com>', // sender address
        to: option.mailTo, // list of receivers
        subject: option.subject, // Subject line
        text: option.text, // plain text body
    }
    let info = await transport.sendMail(message);
    console.log("Message sent: %s", info.messageId);
}

const getImgBarcode = async function  (url){
    try {
        let value = await axios.get(url);
        let textData = value.data
        const imgTags = textData.match(/<img [^>]*src="[^"]*"[^>]*>/gm);
       // let barcodeNumber = textData.match(/barcode_number\s*"\s*>\s*(.+?)<\s*\/\s*p\s*>/)
        let img;
        for (let i = 0; i < imgTags.length; i++) {
            let item = imgTags[i];
            if(item.includes('src="/hosted')){
                img = `https://secure.mite.pay360.com${item.match(/srcs*=s*"(.+?)"/)[1]}`;
                break;
            }
        }
        return img;

    } catch (e) {
        console.log("error when scrap img barcode", e);
    }
}

const downloadImg = async function (fileUrl, fileName) {

    // The path of the downloaded file on our machine
    const localFilePath = path.resolve("../barcode-fe/src/assets/barcode/", fileName);
    try {
        const response = await axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream',
        });
        const w = response.data.pipe(fs.createWriteStream(localFilePath));
        w.on('finish', () => {
            console.log(`Successfully downloaded file! ${localFilePath}`);
        });
    } catch (err) {
        console.log("err", err)
        throw new Error(err);
    }
};


module.exports = {sendEmail,getImgBarcode, downloadImg};
