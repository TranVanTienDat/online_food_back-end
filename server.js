const express = require("express");
const app = express();
const userDB = require("./dataBase/connection");
const bodyParser = require("body-parser");
const connect = require("./dataBase/connection");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const cors = require("cors");

const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use(cors());

app.use("/", require("./routes/route.js"));

// Connect db
userDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
