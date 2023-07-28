const {User, CompanyUser} = require('../models/userModel')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors/index')
const {attachCookies, userInfoToken, checkUserPermission} = require('../utils')


const getAllUsers = async (req, res) => {
    //Find all the users and remove the password field from the response.
    const users = await User.find({role:'user'}).select('-password')
    res.status(StatusCodes.OK).json({users})
}

const getSingleUser = async (req, res) => {
    const {id} = req.params
    //Find the user with the id recieved from the client and revmove the password field.
    const user = await User.findById(id).select('-password')
    if(!user){
        throw new CustomError.NotFoundError(`No user with id:${id}`)
    }

    //Check to make sure the user requesting the a user's information is either an admin, or is the user being requested.
    checkUserPermission(req.user, user._id)
    
    //Return the user with status 200.
    res.status(StatusCodes.OK).json({user})
}

//Return the user's name, id, and role.
const getCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({user: req.user})
}

//Function to update user informtion. Returns 200, and new user information upon successful update.
const updateUser = async (req, res) => {
    const {name, email} = req.body
    if(!name || !email){
        throw new CustomError.BadRequestError('Please provide all fields.')
    }

    //Find the user with the id.
    const user = await User.findOne({_id: req.user.userID})
    //Update the name and email fields of the user to the new values.
    user.name = name
    user.email = email
    //Save the new data to the db.
    await user.save()

    const userInfo = userInfoToken(user)
    //Create a new cookie with the new user information.
    attachCookies({res, user: userInfo})
    //Return the new user info to the client.
    res.status(StatusCodes.OK).json({user: {userInfo}})
}

//Function that updates user password.
const updateUserPassword = async (req, res) => {
    const{currentPassword, newPassword} = req.body
    //Check to make sure both are present.
    if(!currentPassword || !newPassword){
        throw new CustomError.BadRequestError('Please provide all fields')
    }
    //Find the user in the db.
    const user = await User.findOne({_id:req.user.userID})

    //Check to make sure the currentPassword is correct.
    const isPasswordCorrect = await user.comparePasswords(currentPassword)
    //If it's not throw an error.
    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('Password is incorrect')
    }

    //Update the user object with the new password.
    user.password = newPassword
    await user.save()

    res.status(StatusCodes.OK).json({msg: 'Password updated.'})
}

module.exports = {
    getAllUsers,
    getSingleUser,
    getCurrentUser,
    updateUser,
    updateUserPassword,
}