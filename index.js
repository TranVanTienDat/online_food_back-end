const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const userDB = require("./dataBase/connection");
const connect = require("./dataBase/connection");
const route = require("./routes/route");
const http = require("http");
const cors = require("cors");
dotenv.config({ path: ".env" });

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use(cors());

app.use("/", route);
app.get("/home", (req, res) => {
  res.status(200).send("success");
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Connect db
userDB();
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
