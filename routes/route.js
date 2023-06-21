const express = require("express");
const a = require("../controller/controller");
const route = express.Router();

route.post("/api/user/register", a.create);
route.post("/api/user/login", a.login);
route.get("/api/user/getAuth", a.getUserData);
route.get("/api/users", a.get);
route.put("/api/user/:id", a.update);
route.put("/api/user/password/:id", a.updatePassword);
module.exports = route;
