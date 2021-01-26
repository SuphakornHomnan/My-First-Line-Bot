const line = require("@line/bot-sdk");
const express = require("express");
const app = express();

app.listen(8080, () => {
  console.log(`server run on port 8080`);
});
