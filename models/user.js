const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//User model.
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'Please provide a name.'],
        minLength: 3,
        maxLength: 100
    },
    email: {
        type: String,
        require: [true, 'Please provide an email.'],
        minLength: 3,
        maxLength: 50,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide a valid email.'
        ],
        //
        unique: true,
    },
    password: {
        type: String,
        require: [true, 'Please provide a password.'],
        minLength: 8,
    },
})

//This pre-middleware hashes the password the user supplies before the user is created in the db.
//In this instance 'this' refers to the document.
userSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

//userSchema instance method that is accessible anywhere in the server.
userSchema.methods.genJWT = function () {
    //Sign the jwt.
    return jwt.sign(
        {userID:this._id, name:this.name}, 
        process.env.JWT_SECRET, 
        {expiresIn: process.env.JWT_EXPIRATION})
}

//Document instance method that compares the user supplied password with the password hash saved in the db, returns true is they match.
userSchema.methods.comparePassword = async function (possiblePassword){
    const isMatch = await bcrypt.compare(possiblePassword, this.password)
    return isMatch
}

module.exports = mongoose.model('User',userSchema)