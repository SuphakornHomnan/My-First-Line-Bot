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
const {
  send_health_info,
  send_payment_info,
} = require("./helpers/send_response");
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
  console.log("req.body");
  console.log(req.body);
  console.log("----------");
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
    var o_clock = `${hours_count}:${minute_count}:${second_count}`;
    console.log(o_clock);
    if (!trigger_date && o_clock === "1:9:0") {
      // check_data().then((result) => {
      //   console.log("--------");
      //   console.log(result);
      //   if (result._id.length > 0) {
      //     write_file(o_clock, result);
      //     shell.exec("chmod +x ./test.sh");
      //     shell.exec("./test.sh");
      //   } else {
      //     //Don't send msg to guardians
      //     console.log(`today don't have child absent`);
      //   }
      // });
    } else {
      // Do nothing
    }
  }

  function run() {
    setInterval(() => {
      send_msg();
    }, SECOND);
  }
  run();
})();
async function handleEvent(event) {
  console.log(event);
  const guardian_line_id = event.source.userId;
  var payload = {};
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
    payload = {
      type: "text",
      text: "ยินดีครับ ^ ^",
    };
  } else if (
    event.message.text === "Thank you" ||
    event.message.text === "Thx" ||
    event.message.text === "thx"
  ) {
    payload = {
      type: "text",
      text: "Your welcome ^ ^",
    };
  } else if (event.message.text === "check_health") {
    const result = await send_health_info("Uaf3e8e05760c1392233f0aaa85f83b87");
    console.log(result);
    payload = {
      type: "text",
      text: result,
    };
  } else if (event.message.text === "check_payment") {
    const reply_payment = await send_payment_info(guardian_line_id);
    console.log(reply_payment);
    payload = {
      type: "text",
      text: reply_payment,
    };
  } else {
    payload = {
      type: "text",
      text: "ฉันไม่สามารถตอบโต้คำถามนี้ได้ ขอโทษนะ",
    };
  }
  // use reply API
  return client.replyMessage(event.replyToken, payload);
}

// listen on port
const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
