const mongoose = require('mongoose')

//Connect to the db using the url provided.
const connectDB = (url) => {
 return mongoose.connect(url)
}

module.exports = connectDB