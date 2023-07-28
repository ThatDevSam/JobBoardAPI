const CustomError = require('../errors/index')

//This is a function that check if a user owns the resource they are requesting. It returns true if they do, and throws an unauthorized error if they do not.
const checkUserPermission = (requestUser, resourceUserID) => {

    //If the user is an admin, they can perform the action.
    if(requestUser.role === 'admin') return

    //If the user's ID requesting the action matches the id in the resourceUserID object they can perfrom the aciton.
    if(requestUser.userID === resourceUserID.toString()) return

    throw new CustomError.UnauthorizedError('This user is not authorized to perform this action on this resource.')

}

module.exports = {checkUserPermission}