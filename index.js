"use strict";

const line = require("@line/bot-sdk");
const express = require("express");
require("./mongo");
// const logger = require("morgan");
// const cors = require("cors");
// const bodyParser = require("body-parser");
const attendances = require("./attendaces");
const childs = require("./child");
const healths = require("./health");
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
// app.use(logger("dev"));
// app.use(cors({ credentials: true, origin: true }));
// app.use(bodyParser.json());
// app.use(express.json());
// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});
app.post("/", async (req, res) => {
  console.log("hi");
  console.log(req.body);
  const { msg } = req.body;
  const text_temp = msg.split(" ");
  try {
    const child = await childs.findOne({
      firstname: text_temp[0],
      lastname: text_temp[1],
    });
    console.log(child._id);
    console.log(moment().format("YYYY-MM-DD"));
    const attend = await attendances.findOne({
      date: moment().format("YYYY-MM-DD") + "T00:00:00.000+00:00",
      child: child._id,
    });
    console.log(attend);
    let reply_attend = null;
    if (attend) {
      if (attend.attend) {
        reply_attend = "มาถึงห้องเรียนแล้วครับ";
      } else {
        reply_attend = "ไม่มาเรียนนะครับ";
      }
    } else {
      reply_attend = "ยังไม่มาถึงห้องเรียนครับ";
    }

    res.send(`วันนี้น้อง ${text_temp[0]} ${text_temp[1]} ${reply_attend}`);
  } catch (error) {
    console.log(error.message);
    res.status(400).end();
  }
});
// event handler
async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  let text_temp = event.message.text.split(" ");
  if (text_temp.length > 1) {
    try {
      const child = await childs.findOne({
        nickname: text_temp[0],
      });
      console.log(child._id);
      if (text_temp[1] === "มาถึงห้องเรียนรึยัง") {
        console.log(moment().format("YYYY-MM-DD"));
        const attend = await attendances.findOne({
          date: moment().format("YYYY-MM-DD") + "T00:00:00.000+00:00",
          child: child._id,
        });
        console.log(attend);
        let reply_attend = null;
        if (attend) {
          if (attend.attend) {
            reply_attend = "มาถึงห้องเรียนแล้วครับ";
          } else {
            reply_attend = "ไม่มาเรียนนะครับ";
          }
        } else {
          reply_attend = "ยังไม่มาถึงห้องเรียนครับ";
        }
        const payload = {
          type: "text",
          text: `วันนี้น้อง ${text_temp[0]} ${reply_attend}`,
        };
        return client.replyMessage(event.replyToken, payload);
      } else if (text_temp[1] === "สบายดีไหมวันนี้") {
        const info = await healths.findOne({
          date: moment().format("YYYY-MM-DD") + "T00:00:00.000+00:00",
          child: child._id,
        });
        let reply_health = null;
        if (info) {
          if (info.temperature) {
            reply_health = "สบายดีครับ ^ ^";
          } else {
            reply_health = "ไม่สบายนะครับ(เป็นไข้ ตัวร้อน) ";
          }
        } else {
          reply_health = "ยังไม่ได้ตรวจไข้ครับ";
        }
        const payload = {
          type: "text",
          text: `วันนี้น้อง ${text_temp[0]} ${reply_health}`,
        };
        return client.replyMessage(event.replyToken, payload);
      }
    } catch (error) {
      console.log(error.message);
      res.status(400).end();
    }
  } else {
    // create a echoing text message
    const echo = { type: "text", text: event.message.text };
    // use reply API
    return client.replyMessage(event.replyToken, echo);
  }

  // ชื่อ นามสกุล มาถึงห้องเรียนรึยัง?
}

// listen on port
const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
