const express = require("express");
const controller = require("../controller/controller");
const route = express.Router();

route.post("/api/user/register", controller.create);
route.post("/api/user/login", controller.login);
route.get("/api/user/getAuth", controller.getUserData);
route.get("/api/users", controller.get);
route.put("/api/user/:id", controller.update);
route.put("/api/user/password/:id", controller.updatePassword);
route.post("/api/user/forgot-password", controller.forgotPassword);
route.delete("/api/user/deleteUser/:id", controller.deleteUser);
module.exports = route;
