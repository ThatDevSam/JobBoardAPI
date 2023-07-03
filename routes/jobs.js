const express = require('express')
const router = express.Router()
const {getAllJobs, getJob, createJob, updateJob, deleteJob} = require('../controllers/jobs')

//Job post routes and their associated controllers.
router.route('/').post(createJob).get(getAllJobs)
router.route('/:id').get(getJob).patch(updateJob).delete(deleteJob)

module.exports = router
