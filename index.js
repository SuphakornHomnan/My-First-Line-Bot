const line = require("@line/bot-sdk");
const express = require("express");
const app = express();
const api = require("./routes/index");
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", api);
app.use("/", (req, res) => {
  res.send("Hello everyone");
});
app.listen(8080, () => {
  console.log(`server run on port 8080`);
});
