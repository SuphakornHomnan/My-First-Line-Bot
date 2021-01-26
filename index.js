"use strict";

const line = require("@line/bot-sdk");
const express = require("express");
require("./mongo");
const attendances = require("./attendaces");
const childs = require("./child");
var moment = require("moment");
// create LINE SDK config from env variables
const config = {
  channelAccessToken:
    "exBaua04Is156G9zTpYwWOHZ6G7fSErmWVb52ft27laxkvlteQ16YoreJXMS8X0onZ7wQ+/saIZf6nhffBeX8bhXt42hpVF9kMKpQK7oWg0GSvN9+jBbxixWzciyWRr/yuuu9wY1s6NhoqJjAYK4uAdB04t89/1O/w1cDnyilFU=",
  channelSecret: "6d5885772a614b984fd421e8193030ef",
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callback", line.middleware(config), (req, res) => {
  console.log(req.body);
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  // ชื่อ นามสกุล มาถึงห้องเรียนรึยัง?
  const text_temp = event.message.text.split(" ");
  console.log(text_temp);
  if (
    event.message.type === "text" &&
    text_temp[2] === "มาถึงห้องเรียนรึยัง?"
  ) {
    const child = childs.findOne({
      firstname: text_temp,
      lastname: text_temp[1],
    });
    console.log(child);
    const attend = attendances.findOne({
      date: moment().format("YYYY-MM-DD"),
      child,
    });
    console.log(attend);
    let reply_attend = null;
    if (attend.attend) {
      reply_attend = "มาถึงห้องเรียนแล้วครับ";
    } else {
      reply_attend = "ยังไม่มาถึงห้องเรียนครับ";
    }
    const payload = {
      type: "text",
      text: `วันนี้น้อง ${text_temp[0]} ${text_temp[1]} ${reply_attend}`,
    };
    return client.replyMessage(event.replyToken, payload);
  } else {
    // create a echoing text message
    const echo = { type: "text", text: event.message.text };

    // use reply API
    return client.replyMessage(event.replyToken, echo);
  }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
