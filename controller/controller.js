const userDB = require("../models/model");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const e = require("express");

// User registration
// exports.create = (req, res) => {
//   if (!req.body) {
//     res.status(400).send({ message: "not found" });
//     return;
//   }
//   const {
//     name,
//     email,
//     password,
//     gender = "",
//     address = "",
//     phoneNumber = "",
//   } = req.body;
//   const user = userDB.findOne({ email }).then((foundUser) => {
//     if (foundUser) {
//       return res.status(409).send({ message: "Email already exists" });
//     }

//     const saltRounds = 10;
//     bcrypt
//       .hash(password, saltRounds)
//       .then((hashedPassword) => {
//         const user = new userDB({
//           name,
//           email,
//           password: hashedPassword,
//           gender,
//           address,
//           phoneNumber,
//         });
//         user
//           .save()
//           .then((data) => {
//             res.status(200).json(data);
//           })
//           .catch((err) => res.status(500).send({ message: "error" }));
//       })
//       .catch((err) => {
//         console.log(err);
//         res.status(500).send({ message: "error" });
//       });
//   });
// };

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
    argon2
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
// exports.get = (req, res) => {
//   if (req.query.id) {
//     const id = req.query.id;

//     userDB
//       .findById(id)
//       .then((data) => {
//         if (!data) {
//           res.status(404).send({ message: "Not found user with id " + id });
//         } else {
//           res.send(data);
//         }
//       })
//       .catch((err) => {
//         res
//           .status(500)
//           .send({ message: "Error retrieving user with id " + id });
//       });
//   } else {
//     userDB
//       .find()
//       .then((user) => {
//         res.send(user);
//       })
//       .catch((err) => {
//         res.status(500).send({
//           message:
//             err.message || "Error Occurred while retrieving user information",
//         });
//       });
//   }
// };

exports.get = (req, res) => {
  if (req.query.id) {
    const id = req.query.id;

    userDB
      .findById(id)
      .then((data) => {
        if (!data) {
          res.status(404).send({ message: "Not found user with id " + id });
        } else {
          // Send the user data without password
          const { password, ...userData } = data._doc;
          res.send(userData);
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
      .then((users) => {
        // Exclude passwords from the response
        const filteredUsers = users.map((user) => {
          const { password, ...userData } = user._doc;
          return userData;
        });

        res.send(filteredUsers);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Error occurred while retrieving user information",
        });
      });
  }
};

//Update user
// exports.update = (req, res) => {
//   if (!req.body) {
//     res.status(400).send({ message: "error" });
//   }

//   const id = req.params.id;

//   userDB
//     .findByIdAndUpdate(id, req.body, { useFindAndModify: false })
//     .then((data) => {
//       if (!data) {
//         res.status(404).send({ message: `update isn't success for ${id}` });
//       } else {
//         res.send(data);
//       }
//     })
//     .catch((err) => {
//       res.status(500).send({ message: "error update" });
//     });
// };

exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "error" });
  }

  const id = req.params.id;

  // Exclude password field from the update data
  const { password, ...updateData } = req.body;

  // Only hash the password if it is provided in the update data
  if (password) {
    // Hash the password using argon2
    argon2
      .hash(password)
      .then((hashedPassword) => {
        // Update the updateData object with the hashed password
        updateData.password = hashedPassword;

        userDB
          .findByIdAndUpdate(id, updateData, { useFindAndModify: false })
          .then((data) => {
            if (!data) {
              res
                .status(404)
                .send({ message: `Update isn't successful for ${id}` });
            } else {
              res.send(data);
            }
          })
          .catch((err) => {
            res.status(500).send({ message: "Error updating user" });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ message: "Error hashing password" });
      });
  } else {
    userDB
      .findByIdAndUpdate(id, updateData, { useFindAndModify: false })
      .then((data) => {
        if (!data) {
          res
            .status(404)
            .send({ message: `Update isn't successful for ${id}` });
        } else {
          res.send(data);
        }
      })
      .catch((err) => {
        res.status(500).send({ message: "Error updating user" });
      });
  }
};

// Login users
// exports.login = (req, res) => {
//   userDB
//     .findOne({ email: req.body.email })
//     .then((foundUser) => {
//       if (!foundUser) {
//         return res.status(404).send({ message: "Email not registered." });
//       }

//       bcrypt
//         .compare(req.body.password, foundUser.password)
//         .then((match) => {
//           if (!match) {
//             return res.status(401).send({ message: "Incorrect password" });
//           }

//           const token = jwt.sign(
//             { id: foundUser._id },
//             process.env.ACCESS_TOKEN_SECRET
//           );
//           res
//             .status(200)
//             .send({ auth: true, token: token, message: "Success" });
//         })
//         .catch((error) => {
//           res.status(500).send({ message: "Internal server error" });
//         });
//     })
//     .catch((error) => {
//       res.status(500).send({ message: "Internal server error" });
//     });
// };
exports.login = (req, res) => {
  userDB
    .findOne({ email: req.body.email })
    .then((foundUser) => {
      if (!foundUser) {
        return res.status(404).send({ message: "Email not registered." });
      }

      argon2
        .verify(foundUser.password, req.body.password)
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
// exports.updatePassword = (req, res) => {
//   if (!req.body) {
//     return res.status(400).send({ message: "error" });
//   }
//   const id = req.params.id;
//   const newPassword = req.body.newPassword;
//   const currentPassword = req.body.currentPassword;

//   userDB
//     .findById(id)
//     .then((foundUser) => {
//       if (!foundUser) {
//         return res
//           .status(404)
//           .send({ message: `User not found with id ${id}` });
//       }

//       bcrypt
//         .compare(currentPassword, foundUser.password)
//         .then((match) => {
//           if (!match) {
//             return res
//               .status(401)
//               .send({ message: "Incorrect current password" });
//           }

//           const saltRounds = 10;
//           bcrypt
//             .hash(newPassword, saltRounds)
//             .then((hashedPassword) => {
//               userDB
//                 .findByIdAndUpdate(
//                   id,
//                   { password: hashedPassword },
//                   { useFindAndModify: false }
//                 )
//                 .then((data) => {
//                   if (!data) {
//                     res
//                       .status(404)
//                       .send({ message: `Update unsuccessful for user ${id}` });
//                   } else {
//                     res.send({ message: "Password updated successfully." });
//                   }
//                 })
//                 .catch((err) => {
//                   res.status(500).send({ message: "Error updating password" });
//                 });
//             })
//             .catch((err) => {
//               res.status(500).send({ message: "Error" });
//             });
//         })
//         .catch((error) => {
//           res.status(500).send({ message: "Internal server error" });
//         });
//     })
//     .catch((error) => {
//       res.status(500).send({ message: "Internal server error" });
//     });
// };

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

      argon2
        .verify(foundUser.password, currentPassword)
        .then((match) => {
          if (!match) {
            return res
              .status(401)
              .send({ message: "Incorrect current password" });
          }

          const saltRounds = 10;

          argon2
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

// new password
// exports.forgotPassword = (req, res) => {
//   const email = req.body.email;

//   userDB.findOne({ email }).then((foundUser) => {
//     if (!foundUser) {
//       return res.status(404).send({ message: "Email not registered." });
//     }

//     //  Generate new password
//     const newPassword = Math.random().toString(36).substring(2, 8);

//     // Hash new password and update in db
//     const saltRounds = 10;
//     bcrypt
//       .hash(newPassword, saltRounds)
//       .then((hashedPassword) => {
//         userDB
//           .findByIdAndUpdate(
//             foundUser._id,
//             { password: hashedPassword },
//             { useFindAndModify: false }
//           )
//           .then(() => {
//             // Return new password to user
//             res
//               .status(200)
//               .send({ message: `Your new password is: ${newPassword}` });
//           })
//           .catch((error) => {
//             res.status(500).send({ message: "Internal server error" });
//           });
//       })
//       .catch((error) => {
//         res.status(500).send({ message: "Internal server error" });
//       });
//   });
// };

exports.forgotPassword = (req, res) => {
  const email = req.body.email;

  userDB.findOne({ email }).then((foundUser) => {
    if (!foundUser) {
      return res.status(404).send({ message: "Email not registered." });
    }

    //  Generate new password
    const newPassword = Math.random().toString(36).substring(2, 8);

    // Hash new password and update in db
    const saltRounds = 10;
    argon2
      .hash(newPassword, { salt: saltRounds })
      .then((hashedPassword) => {
        userDB
          .findByIdAndUpdate(
            foundUser._id,
            { password: hashedPassword },
            { useFindAndModify: false }
          )
          .then(() => {
            // Return new password to user
            res
              .status(200)
              .send({ message: `Your new password is: ${newPassword}` });
          })
          .catch((error) => {
            res.status(500).send({ message: "Internal server error" });
          });
      })
      .catch((error) => {
        res.status(500).send({ message: "Internal server error" });
      });
  });
};

// delete account
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  userDB
    .findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res.status(400).send({ message: "Error can not be deleted" });
      } else {
        res.send({ message: "Delete successfully." });
      }
    })
    .catch(() => {
      res.status(500).send({ message: "Internal server error" });
    });
};
