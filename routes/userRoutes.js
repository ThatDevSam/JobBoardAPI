const express = require('express')
const router = express.Router()
const {authenticateUser, authorizeUser} = require('../middleware/authMiddleware.js')
const {
    getAllUsers,
    getSingleUser,
    getCurrentUser,
    updateUser,
    updateUserPassword
} = require('../controllers/userController')

router.route('/').get(
    authenticateUser, 
    authorizeUser('admin'), //admin is the only authorized user role for this route.
    getAllUsers)
router.route('/currentUser').get(authenticateUser, getCurrentUser)
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword)
router.route('/updateUser').patch(authenticateUser, updateUser)
router.route('/:id').get(authenticateUser, getSingleUser)

module.exports = router
