//API address to receive callback from pay360
const API_RECEIVE_NOTIFY_BARCODE_CREATE =
  "http://165.227.236.153/merchant/callback";

//API Address to request create barcode link
const API_REQUEST_BARCODE =
  " https://api.mite.pay360.com/acceptor/rest/transactions/5308695/payment";

//Data when send request create barcode link
const POST_DATA_BARCODE = function (price) {
  return {
    transaction: {
      currency: "GBP",
      amount: price,
      commerceType: "ECOM",
    },
    paymentMethod: {
      payCash: {},
    },
    callbacks: {
      transactionNotification: {
        url: `${API_RECEIVE_NOTIFY_BARCODE_CREATE}`,
        /* "format": "REST_XML"*/
        format: "REST_JSON",
      },
    },
  };
};

//Header when send request create barcode link
const HEADER_AUTHORIZATION = {
  "Content-Type": "application/json",
  Authorization:
    "Basic VTVGT1dZV0daWkVESk1WUFQyQ1c0TlczTFE6RXdZTytxc2RYWU9aUmZvZ1pFd1VqQT09",
};

//Yahoo
const yahoo = {
  host: "smtp.mail.yahoo.com",
  port: 587,
  secure: false,
  auth: {
    user: "",
    pass: "",
  },
}

//Gmail
const gmail = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "barcode.payment.uk@gmail.com",
    pass: "aigajetrgdfuulpo",
  },
}

//Nodemailer config
const NODEMAILER_CONFIG = gmail;

//Option when send email
let option = {
  mailTo: 'vewaho5793@mnqlm.com',
  subject: `Transaction complete`,
  text: "callBackData"
}

module.exports = {
  NODEMAILER_CONFIG,
  POST_DATA_BARCODE,
  HEADER_AUTHORIZATION,
  API_REQUEST_BARCODE,
};
