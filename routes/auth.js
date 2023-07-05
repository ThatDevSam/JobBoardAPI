const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const {login, register} = require('../controllers/auth')

//This package limits the amount of times an IP can make a request to 10 requests per 15 mintues.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 10,
    message: {
      msg: "This IP has made to many requests, please try again in 15 minutes."
    }
  })

//Authentication routes and their associated controllers.
router.post('/register', apiLimiter, register)
router.post('/login', apiLimiter, login)

module.exports = router
