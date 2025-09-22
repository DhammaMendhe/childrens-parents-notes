const express = require("express")
const connection = require("./dbConnection")
const app = express()
const port = 3000;

connection()

app.listen(port,()=>{console.log("listeing to server at port",port)})