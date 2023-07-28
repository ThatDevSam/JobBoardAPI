const mongoose = require('mongoose')

//This function accepts a database url and attempts to connect to it.
const connectDB = (url) => {
    return mongoose.connect(url)
}

module.exports = connectDB