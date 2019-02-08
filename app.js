const express =  require("express");
const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/html/index.html");
});

app.listen(8080);

module.exports = app;
