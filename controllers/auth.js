const User = require('../models/user')
const {createCustomError} = require('../errors/customError')

const register = async(req, res, next) => {
    //Before the user is created the password will be salted using the pre-middleware in the user model file.
    //Pass the body object of the request to the db.
    const user = await User.create({...req.body})
    const token = user.genJWT() //generate the JsonWeb Token.
    //Return the pertinent user information and new token.
    res.status(201).json({
        user:{
            firstName:user.firstName,
            lastName:user.lastName,
            state: user.state,
            city: user.city,
            zip: user.zip,
            email: user.email,
            token,
        },
    })
}

//Authenticate the user and return a new token, and user info.
const login = async(req, res, next) => {
   const {email, password} = req.body
   if(!email || !password){
    return next(createCustomError("Please provide an email and a password", 400))
   }

   //Get the user document from the db.
   const user = await User.findOne({email})
   if(!user){
    return next(createCustomError("Invalid credentials.", 401))
   }

   //Call the password compare schema instance method.
   const isPasswordMatch = await user.comparePassword(password)
   if(!isPasswordMatch){
    return next(createCustomError("Invalid credentials.", 401))
   }

   //Create a new token for the authenticated user.
   const token = user.genJWT();
   //Return the pertinent user information and new token.
   res.status(200).json({
    user:{
        firstName:user.firstName,
        lastName:user.lastName,
        state: user.state,
        city: user.city,
        zip: user.zip,
        email: user.email,
        token,
    },
    })
}
module.exports = {
    register,
    login,
}