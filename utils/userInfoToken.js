//This function take a user object and returns some destrucutred properties to be stored in the user's token.
const userInfoToken = (user) => {
    return {name: user.name, userID: user._id, role: user.role}
}

module.exports = {userInfoToken}