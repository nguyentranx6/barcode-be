const axios = require('axios');
let headers = {
    'Content-Type': 'application/json',
    "Authorization": "Basic VTVGT1dZV0daWkVESk1WUFQyQ1c0TlczTFE6RXdZTytxc2RYWU9aUmZvZ1pFd1VqQT09"
}

let url = " https://api.mite.pay360.com/acceptor/rest/transactions/5308695/payment";
let getImgBarcode = async function  (url){
    try {
        let value = await axios.get(url);
        let textData = value.data
        const imgTags = textData.match(/<img [^>]*src="[^"]*"[^>]*>/gm);
        let barcodeNumber = textData.match(/barcode_number\s*"\s*>\s*(.+?)<\s*\/\s*p\s*>/)
        let img;
        for (let i = 0; i < imgTags.length; i++) {
            let item = imgTags[i];
            if(item.includes('src="/hosted')){
                img = `https://secure.mite.pay360.com${item.match(/srcs*=s*"(.+?)"/)[1]}`;
                break;
            }
        }
        return {url: img, barcode: barcodeNumber[1]}
    } catch (e) {

    }
}
exports.getBarcode = async (req, res, next) => {
    try {
        let price = req.query.price;

        let data = {
            "transaction": {
                "currency": "GBP", "amount": price, "commerceType": "ECOM"
            }, "paymentMethod": {
                "payCash": {}
            },
        }
        let val = await axios.post(url, data, {headers: headers});
        let urlImg = val.data.processing.payCashResponse.barcodeUrl;
        let img = await getImgBarcode(urlImg)
        res.status(201).send({data: val.data,img,
            message: "Success created barcode"})
    }
         catch (e) {
             console.log("e", e)
        next(e);
    }
}

