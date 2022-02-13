require("dotenv").config();
const express = require("express");
const app = express();
const dbConnection = require('./db')
const cors = require('cors');
app.use(cors());
const controllers = require("./controllers");

app.use(express.json())
app.use('/review', controllers.reviewController)
app.use("/products", controllers.productController);
app.use('/user', controllers.userController)

dbConnection
  .authenticate()
  .then(() => dbConnection.sync())
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`[Server]: App is listening on PORT: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`[Server]: Server crashed. Error = ${err}`);
  });
  
  // {force: true} dfsdf