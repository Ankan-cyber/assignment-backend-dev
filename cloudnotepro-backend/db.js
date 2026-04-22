const mongoose = require('mongoose')
mongoose.set('strictQuery', false);

const MongoConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("connected to Mongo successfully")
  } catch (error) {
    console.error("Mongo connection failed", error.message);
    process.exit(1);
  }
}
module.exports=MongoConnect;
