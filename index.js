require("dotenv").config();
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const express = require("express");
const nodemailer = require("nodemailer");
const fileParser = require("express-multipart-file-parser");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileParser);

// Set the maximum instances to 9 for all functions
setGlobalOptions({ maxInstances: 9 });

const responseHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body style="box-sizing:border-box; background: #ffffff;
display:flex;justify-content:center; align-items:center;
height:100vh;
background: linear-gradient(to bottom, #ffffff 0%,#e1e8ed 100%);
filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#e1e8ed',GradientType=0 );
    height: 100%;
        margin: 0;
        background-repeat: no-repeat;
        background-attachment: fixed;">
    <div class="display:flex;justify-content:center; align-items:center;">
        <div class="width:100%;
        height:100vh;
        display: flex;
      flex-direction: column;">
          <div class="padding :30px;
          text-align:center;">
            <h1 style="font-family: 'Kaushan Script', cursive;
            font-size:4em;
            letter-spacing:3px;
            color:#b82530 ;
            margin:0;
            margin-bottom:20px;">Thank you !</h1>
            <p style="margin:0;
            font-size:1.3em;
            color:#aaa;
            font-family: 'Source Sans Pro', sans-serif;
            letter-spacing:1px;">Thanks for contacting us.  </p>
            <p style="margin:0;
            font-size:1.3em;
            color:#aaa;
            font-family: 'Source Sans Pro', sans-serif;
            letter-spacing:1px;">You'll hear from us soon.  </p>
            <a href="http://built9.ae">
                <button style="color:#fff;
            background:#b82530;
            border:none;
            padding:10px 50px;
            margin:30px 0;
            border-radius:30px;
            text-transform:capitalize;
            box-shadow: 0 10px 16px 1px rgba(174, 199, 251, 1);" class="go-home">
            go home
            </button>
            </a>
          </div>
          
      </div>
      </div>
      
      
      
      <link href="https://fonts.googleapis.com/css?family=Kaushan+Script|Source+Sans+Pro" rel="stylesheet">
</body>
</html>`;

app.get("/", (req, res) => {
  res.send("Welcome to Built9.");
});

app.get("/sendmail", async (req, res) => {
  let name = req.query.firstname;
  let lastname = req.query.lastname;
  let email = req.query.email;
  let phone = req.query.phone;
  let services = req.query.services;
  let message = req.query.message;
  let text = `First Name: ${name}\nLast Name: ${lastname}\nEmail: ${email}\nPhone: ${phone}\nServices: ${services}\nMessage: ${message}`;
  let result = await setMessageSend(text);
  if (result == 200) {
    return res.status(200).send(responseHtml);
  } else {
    res.status(203);
  }
});

app.post("/careermail", async (req, res) => {
  try {
    const name = req.body.name; // use req.body to access form fields
    const email = req.body.email;
    const phone = req.body.phone;
    const file = req.files ? req.files[0] : undefined;

    if (!file) {
      return res.status(400).send("No file was uploaded.");
    }
    const text = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}`;
    let result = await sendWithAttachment(text, file);
    if (result === 200) {
      return res.status(200).send(responseHtml);
    } else {
      res.status(203).send("Error");
    }
  } catch (e) {
    console.log("NODE ERROR (/careermail): " + e);
  }
});

let transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

let message = {};

async function setMessageSend(text) {
  message = {
    from: process.env.EMAIL_USERNAME,
    // Comma separated list of recipients
    to: process.env.TOMAILID,

    // Subject of the message
    subject: "Reach Out from Built9 Website",

    // plaintext body
    text: text,
  };
  return await sendMessage(message);
}

async function sendWithAttachment(text, file) {
  try {
    message = {
      from: process.env.EMAIL_USERNAME,
      // Comma separated list of recipients
      to: process.env.TOMAILID,

      // Subject of the message
      subject: "Joining Request: From website.",

      //plaintext body
      text: text,

      //attachments
      attachments: [
        {
          filename: file.originalname,
          content: file.buffer,
          encoding: file.encoding,
        },
      ],
    };
    return await sendMessage(message);
  } catch (e) {
    console.log("NODE ERROR (sendWithAttachment): " + e);
    return 400;
  }
}

async function sendMessage(message) {
  try {
    let info = await transporter.sendMail(message);
    if (info.messageId != null) {
      return 200;
    } else {
      return 203;
    }
  } catch (e) {
    console.log("NODE ERROR (sendMessage): " + e);
    return 203;
  }
}

// app.listen(5234, () => {
//   console.log("Running at port 5234");
// });

exports.app = onRequest(app);
