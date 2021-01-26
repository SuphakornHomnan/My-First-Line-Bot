const line = require("@line/bot-sdk");
const express = require("express");
const app = express();
const api = require("./routes/index");

app.use("/api", api);
app.listen(8080, () => {
  console.log(`server run on port 8080`);
});
