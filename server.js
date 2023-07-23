const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const userDB = require("./dataBase/connection");
const connect = require("./dataBase/connection");
const app = express();
const cors = require("cors");
dotenv.config({ path: ".env" });

const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use(cors());

app.use("/", require("./routes/route.js"));
app.get("/home", (req, res) => res.send("hello"));
// Connect db
userDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
