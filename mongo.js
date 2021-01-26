const mongoose = require("mongoose"),
  mongoURL = `mongodb+srv://nice:nicezaa01@first-cluster.nvg6s.mongodb.net/Nursery-new?retryWrites=true&w=majority`;

mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })
  .then(() => console.log(`mongo connected `))
  .catch((err) => console.log(err));
