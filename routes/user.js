const express = require('express')
const router = express.Router()
const {updateUser} = require('../controllers/user')
const authenticateUser = require('../middleware/authenticate')

router.patch('/update', authenticateUser, updateUser )

module.exports = router