const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("Hello Line Bot");
});

module.exports = router;
