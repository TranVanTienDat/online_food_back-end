const mongo = require("mongoose");

const connectDB = async () => {
  try {
    const con = await mongo.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB: ", con.connection.host);
    console.log("connect success");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
