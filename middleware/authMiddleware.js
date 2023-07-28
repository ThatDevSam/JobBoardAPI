const CustomError = require('../errors')
const {verifyToken} = require('../utils')

//This function verifies the user cookie, and returns the request object with the user property
const authenticateUser = async (req, res, next) => {
    const token = req.signedCookies.token;
  
    //If the client did not send the token, return an error.
    if (!token) {
      throw new CustomError.UnauthenticatedError('Authentication failed');
    }
  
    try {
      //Extract this user infomation from the verified token.
      const {name, userID, role} = verifyToken({ token });
      //Attach the user informaiton as a property to the request object to be used in other parts of the server.
      req.user = {name, userID, role}
      //Move the flow of contorl on to the next middleware defined in the routes file.
      next();
    } catch (error) {
      //If the token verification fails, throw an error.
      throw new CustomError.UnauthenticatedError('cookie verification failed');
    }
  };

//This funciton verifies that the user has the appropriate level of permissions to perform the action they are requesting.
const authorizeUser = (...roles) => {
  //Return a callback function so that the authorizeUser function doesn't automatically run.
  return(req, res, next) => {
    //If the user's role is not included in the authorized roles for the route, throw an error.
    if(!roles.includes(req.user.role)){
        throw new CustomError.UnauthorizedError('User not authorized for this action.')
    } 
    ///If the user's role is included ,move the flow of contorl on to the next middleware defined in the routes file.
    next()
  }
}

module.exports = {
    authenticateUser,
    authorizeUser,
}