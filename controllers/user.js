const User = require('../models/user')
const {createCustomError} = require('../errors/customError')

const updateUser = async (req,res, next) => {
    const { 
        user:{userID},
        body:{email, firstName, lastName, state, city, zip}
    } = req
    //Check to make sure the values are present.
    if (!email || !firstName || !lastName || !state || !city || !zip) {
        return next(createCustomError("Please provide all values", 400))
    }
    //Find the current user data in the db
    
    const user = await User.findOneAndUpdate(
        { _id:userID},
        req.body,
        {runValidators:true, returnDocument:'after'}
    ) 

    //generate a new token with new user info, and send back response.
    const token = user.genJWT();
    res.status(200).json({
        user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        state: user.state,
        city: user.city,
        zip: user.zip,
        token,
        },
    });
}

module.exports = {
    updateUser
}