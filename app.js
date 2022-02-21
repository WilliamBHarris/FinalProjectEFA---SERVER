require("dotenv").config();
const fetch = require('node-fetch')

const express = require("express");
const cors = require('cors');
const app = express();

let whitelist = ['http://localhost:3001', 'https://wbh-final-client.herokuapp.com/', 'http://localhost:3000']
app.use(cors({ origin: whitelist, credentials: true }));
const dbConnection = require('./db')
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
  
  // {force: true}