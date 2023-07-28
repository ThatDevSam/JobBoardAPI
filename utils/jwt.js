const jwt = require('jsonwebtoken')

//Functions that accepts user information to be stored in the token, creates the token, then returns it.
const genJWT = ({payload}) => {
    
    const token = jwt.sign(
        payload, //The payload is the user's info.
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRATION} //Defines how long the token is good for.
    ) 

    return token
}

//Function that verifies user supplied token for authentication purposes. If the token is valid it is returned.
const verifyToken = ({token}) => jwt.verify(token, process.env.JWT_SECRET)

//Function that creates a cookie for the user and attaches a jwt to it.
const attachCookies = ({res, user}) => {
    //Generate a new jwt with the user info.
    const token = genJWT({payload: user})

    const oneDay = 1000 * 60 * 60 * 24;

    //Attach the new cookie to the response property to be returned to the user.
    res.cookie('token', token, {
        httpOnly: true, //Prevents the cookie from being edited with JS.
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',//The cookie will only be sent over https when in production.
        signed: true,
        secure: true
    });

}

module.exports = {
    genJWT,
    verifyToken,
    attachCookies
}
