const userDB = require("../models/model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// User registration
exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "not found" });
    return;
  }
  const {
    name,
    email,
    password,
    gender = "",
    address = "",
    phoneNumber = "",
  } = req.body;
  const user = userDB.findOne({ email }).then((foundUser) => {
    if (foundUser) {
      return res.status(409).send({ message: "Email already exists" });
    }

    const saltRounds = 10;
    bcrypt
      .hash(password, saltRounds)
      .then((hashedPassword) => {
        const user = new userDB({
          name,
          email,
          password: hashedPassword,
          gender,
          address,
          phoneNumber,
        });
        user
          .save()
          .then((data) => {
            res.status(200).json(data);
          })
          .catch((err) => res.status(500).send({ message: "error" }));
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ message: "error" });
      });
  });
};

//Take out all users
exports.get = (req, res) => {
  if (req.query.id) {
    const id = req.query.id;

    userDB
      .findById(id)
      .then((data) => {
        if (!data) {
          res.status(404).send({ message: "Not found user with id " + id });
        } else {
          res.send(data);
        }
      })
      .catch((err) => {
        res
          .status(500)
          .send({ message: "Error retrieving user with id " + id });
      });
  } else {
    userDB
      .find()
      .then((user) => {
        res.send(user);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Error Occurred while retrieving user information",
        });
      });
  }
};

//Update user
exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "error" });
  }

  const id = req.params.id;

  userDB
    .findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: `update isn't success for ${id}` });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "error update" });
    });
};

// Login users
exports.login = (req, res) => {
  userDB
    .findOne({ email: req.body.email })
    .then((foundUser) => {
      if (!foundUser) {
        return res.status(404).send({ message: "Email not registered." });
      }

      bcrypt
        .compare(req.body.password, foundUser.password)
        .then((match) => {
          if (!match) {
            return res.status(401).send({ message: "Incorrect password" });
          }

          const token = jwt.sign(
            { id: foundUser._id },
            process.env.ACCESS_TOKEN_SECRET
          );
          res
            .status(200)
            .send({ auth: true, token: token, message: "Success" });
        })
        .catch((error) => {
          res.status(500).send({ message: "Internal server error" });
        });
    })
    .catch((error) => {
      res.status(500).send({ message: "Internal server error" });
    });
};

// Take out JWT
exports.getUserData = (req, res) => {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  const token = authToken.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const userId = decodedToken.id;

    userDB
      .findById(userId)
      .then((foundUser) => {
        res.status(200).send({ user: foundUser });
      })
      .catch((error) => {
        res.status(500).send({ message: "Internal server error" });
      });
  });
};

// Update Password
exports.updatePassword = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "error" });
  }
  const id = req.params.id;
  const newPassword = req.body.newPassword;
  const currentPassword = req.body.currentPassword;

  userDB
    .findById(id)
    .then((foundUser) => {
      if (!foundUser) {
        return res
          .status(404)
          .send({ message: `User not found with id ${id}` });
      }

      bcrypt
        .compare(currentPassword, foundUser.password)
        .then((match) => {
          if (!match) {
            return res
              .status(401)
              .send({ message: "Incorrect current password" });
          }

          const saltRounds = 10;
          bcrypt
            .hash(newPassword, saltRounds)
            .then((hashedPassword) => {
              userDB
                .findByIdAndUpdate(
                  id,
                  { password: hashedPassword },
                  { useFindAndModify: false }
                )
                .then((data) => {
                  if (!data) {
                    res
                      .status(404)
                      .send({ message: `Update unsuccessful for user ${id}` });
                  } else {
                    res.send({ message: "Password updated successfully." });
                  }
                })
                .catch((err) => {
                  res.status(500).send({ message: "Error updating password" });
                });
            })
            .catch((err) => {
              res.status(500).send({ message: "Error" });
            });
        })
        .catch((error) => {
          res.status(500).send({ message: "Internal server error" });
        });
    })
    .catch((error) => {
      res.status(500).send({ message: "Internal server error" });
    });
};
