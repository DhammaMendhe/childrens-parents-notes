const mongoose = require("mongoose")

const MONGOURI = 'mongodb://localhost:27017/';

async function dbconnection() {

try {

    mongoose.connect(MONGOURI);
    console.log("connected to mongodb...")
    
} catch (error) {
    console.log("db not connected...")
}
    
}

module.exports = dbconnection;