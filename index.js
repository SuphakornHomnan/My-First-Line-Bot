const line = require("@line/bot-sdk");
const express = require("express");
const app = express();
const api = require("./routes/index");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = {
  channelAccessToken: `${process.env.CHANNEL_ACCESS_TOKEN}`,
  channelSecret: `${process.env.CHANNEL_SECRET}`,
};
require("dotenv").config();
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", api);

console.log(process.env.CHANNEL_SECRET);
console.log(process.env.CHANNEL_ACCESS_TOKEN);
app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

const client = new line.Client(config);
function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: event.message.text,
  });
}

app.get("/", (req, res) => {
  res.send("Hello everyone");
});
app.listen(8080, () => {
  console.log(`server run on port 8080`);
});
