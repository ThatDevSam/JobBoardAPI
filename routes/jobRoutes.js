const express = require('express')
const router = express.Router()
const {authenticateUser, authorizeUser} = require('../middleware/authMiddleware.js')

const {
    getAllJobs, 
    getSingleJob, 
    createJob, 
    updateJob, 
    deleteJob, 
    showStats,
} = require('../controllers/jobsController.js')

//Job post routes and their associated controllers.
router.route('/')
    //Only a user with the role of company or admin will be able to access this route.
    .post([authenticateUser, authorizeUser('company', 'admin')] ,createJob)
    .get(getAllJobs)

router.route('/stats').get(authenticateUser, showStats)

router.route('/:id')
    .get(getSingleJob)
    .patch([authenticateUser, authorizeUser('company', 'admin')], updateJob)
    .delete([authenticateUser, authorizeUser('company', 'admin')], deleteJob)

//Route to upload user resume?

module.exports = router