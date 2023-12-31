const express = require('express')
const router = express.Router()
const {
    getAllJobs, 
    getJob, 
    createJob, 
    updateJob, 
    deleteJob, 
    showStats,
} = require('../controllers/jobs')

//Job post routes and their associated controllers.
router.route('/').post(createJob).get(getAllJobs)
router.route('/stats').get(showStats)
router.route('/:id').get(getJob).patch(updateJob).delete(deleteJob)

module.exports = router
