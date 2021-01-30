"use strict";
//userId: 'Uaf3e8e05760c1392233f0aaa85f83b87'
const line = require("@line/bot-sdk");
const express = require("express");
const shell = require("shelljs");
const fs = require("fs");
require("./mongo");
// const logger = require("morgan");
// const cors = require("cors");
// const bodyParser = require("body-parser");
const attendances = require("./attendaces");
const childs = require("./child");
const healths = require("./health");
const guardians = require("./guardian");
var moment = require("moment");
// create LINE SDK config from env variables
const config = {
  channelAccessToken:
    "exBaua04Is156G9zTpYwWOHZ6G7fSErmWVb52ft27laxkvlteQ16YoreJXMS8X0onZ7wQ+/saIZf6nhffBeX8bhXt42hpVF9kMKpQK7oWg0GSvN9+jBbxixWzciyWRr/yuuu9wY1s6NhoqJjAYK4uAdB04t89/1O/w1cDnyilFU=",
  channelSecret: "6d5885772a614b984fd421e8193030ef",
};

// create LINE SDK client
const client = new line.Client(config);

const app = express();

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

function check_day(day) {
  if (day === "Sun" || day === "Sat") {
    return false;
  } else {
    return true;
  }
}
async function write_file(o_clock, msg) {
  let users = ``;
  msg._id.forEach((element, index) => {
    users = users.concat(`"`);
    users = users.concat(element);
    if (msg._id.length - 1 === index) {
      users = users.concat(`"`);
    } else {
      users = users.concat(`",`);
    }
  });
  console.log(typeof users);
  console.log(`${users}`);
  console.log(msg.attend);
  console.log(o_clock);
  try {
    await fs.writeFileSync(
      "./test.sh",
      `curl -H 'Content-Type: application/json' -H 'Authorization: Bearer {exBaua04Is156G9zTpYwWOHZ6G7fSErmWVb52ft27laxkvlteQ16YoreJXMS8X0onZ7wQ+/saIZf6nhffBeX8bhXt42hpVF9kMKpQK7oWg0GSvN9+jBbxixWzciyWRr/yuuu9wY1s6NhoqJjAYK4uAdB04t89/1O/w1cDnyilFU=}' -X POST -d '{
        "to": [${users}],
        "messages":[
          {
            "type":"text",
            "text":"น้อง${msg.attend}"
          },
          {
            "type":"text",
            "text":"ตอนนี้เวลา ${o_clock}"
          }
        ]
      }' https://api.line.me/v2/bot/message/multicast`,
      (err) => {
        if (err) {
          console.log("error at write_file_func");
          console.log(err);
        }
        console.log("Saved");
      }
    );
  } catch (err) {
    console.log("error begun");
    console.log(err);
  }
}
async function check_data() {
  const absent_today = await attendances.find({
    date: moment().format("YYYY-MM-DD") + "T00:00:00.000+00:00",
    attend: false,
  });
  console.log(absent_today);
  var info = [];
  for (let i = 0; i < absent_today.length; i++) {
    var temp = await guardians.find({ child: absent_today[i].child });
    console.log(temp);
    for (let j = 0; j < temp.length; j++) {
      if (temp[j].line_id === undefined) {
      } else {
        info.push(temp[j].line_id);
      }
    }
  }
  console.log(info);
  return {
    _id: info,
    attend: "ไม่มาเรียนวันนี้นะครับ",
  };
}
(() => {
  const SECOND = 1000;
  const MINUTE = SECOND * 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;
  function send_msg() {
    var today = new Date();
    var today_str = today.toString();
    var today_split = today_str.split(" ");
    var trigger_date = check_day(today_split[0]);
    var time = today.getTime();
    let hours_count = Math.floor((time % DAY) / HOUR);
    const minute_count = Math.floor((time % HOUR) / MINUTE);
    const second_count = Math.floor((time % MINUTE) / SECOND);

    hours_count += 7;
    if (hours_count > 23) {
      hours_count = hours_count - 24;
    } else {
    }
    var o_clock = `${hours_count}:${minute_count}`;
    console.log(o_clock);
    if (!trigger_date && o_clock === "21:10") {
      check_data().then((result) => {
        console.log("--------");
        console.log(result);
        if (result._id.length > 0) {
          write_file(o_clock, result);
          shell.exec("chmod +x ./test.sh");
          shell.exec("./test.sh");
        } else {
          //Don't send msg to guardians
          console.log(`today don't have child absent`);
        }
      });
    } else {
      //console.log(time);
    }
  }

  function run() {
    setInterval(() => {
      send_msg();
    }, MINUTE);
  }
  run();
})();
async function handleEvent(event) {
  console.log(event);
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  if (
    event.message.text === "ขอบคุณครับ" ||
    event.message.text === "ขอบคุณค่ะ" ||
    event.message.text === "ขอบคุณ" ||
    event.message.text === "ขอบคุณคะ"
  ) {
    const echo = {
      type: "text",
      text: "ยินดีครับ ^ ^",
    };
    return client.replyMessage(event.replyToken, echo);
  } else if (
    event.message.text === "Thank you" ||
    event.message.text === "Thx" ||
    event.message.text === "thx"
  ) {
    const echo = {
      type: "text",
      text: "Your welcome ^ ^",
    };
    return client.replyMessage(event.replyToken, echo);
  }
  if (event.message.text === "ข้อมูลประจำวัน") {
    const echo = {
      type: "text",
      text: "น้องชื่ออะไรครับ",
    };
    return client.replyMessage(event.replyToken, echo);
  } else {
    try {
      const child = await childs.findOne({
        nickname: event.message.text,
      });
      console.log(child);
      console.log(child._id);
      console.log(moment().format("YYYY-MM-DD"));
      const attend = await attendances.findOne({
        date: moment().format("YYYY-MM-DD") + "T00:00:00.000+00:00",
        child: child._id,
      });
      const info = await healths.findOne({
        date: moment().format("YYYY-MM-DD") + "T00:00:00.000+00:00",
        child: child._id,
      });
      console.log(attend);
      console.log(info);
      let reply_attend = null;
      let reply_health = null;
      if (attend) {
        if (attend.attend) {
          reply_attend = `วันนี้น้อง${child.nickname}มาถึงห้องเรียนแล้วครับ`;
        } else {
          reply_attend = `วันนี้น้อง${child.nickname}ไม่มาเรียนนะครับ`;
        }
      } else {
        reply_attend = `วันนี้น้อง${child.nickname}ยังไม่มาถึงห้องเรียนครับ`;
      }
      if (info !== null) {
        if (info.temperature) {
          reply_health = `น้องสบายดีครับวันนี้ ^ ^`;
        } else if (info.temperature === false) {
          reply_health = `น้องไม่สบายนะครับวันนี้`;
        } else {
          reply_health = `น้องยังไม่ได้ตรวจไข้ครับวันนี้`;
        }
      } else {
        reply_health = `น้องยังไม่ได้ตรวจไข้ครับวันนี้`;
      }
      const payload = {
        type: "text",
        text: `${reply_attend}  ${reply_health}`,
      };
      return client.replyMessage(event.replyToken, payload);
    } catch (error) {
      console.log(error.message);
      const echo = {
        type: "text",
        text: "ฉันไม่สามารถตอบโต้คำถามนี้ได้ ขอโทษนะ",
      };
      // use reply API
      return client.replyMessage(event.replyToken, echo);
    }
  }
}

// listen on port
const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
