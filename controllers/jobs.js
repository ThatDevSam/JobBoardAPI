const Job = require('../models/jobs')
const {createCustomError} = require('../errors/customError')

//Find a single job and return it.
const getJob = async(req, res, next) => {
    const {user:{userID}, params: {id:jobID}} = req
    //Find the job with the id that was created by the user requsting it.
    const job = await Job.findOne({
        _id:jobID,
        createdBy:userID
    })
    if(!job){
        return next(createCustomError(`No job with ID: ${jobID}`, 400))
    }
    res.status(200).json({job})
}

//Get all jobs created by a specific user.
const getAllJobs = async(req, res) => {
    const jobs = await Job.find({createdBy:req.user.userID}).sort('createdAt')
    res.status(200).json({hits: jobs.length, jobs})
}

//Create a new job post.
const createJob = async(req, res) => {
    //assign the userID value to the job.createdBy property.
    req.body.createdBy = req.user.userID
    //create the job.
    const job = await Job.create({...req.body})
    res.status(201).json({job})
}

//Update a specific job, and return the new job to the user.
const updateJob = async(req, res, next) => {
    const {
        user:{userID}, 
        params: {id:jobID},
        body:{company, role},
    } = req
    //If the company and role fields are empty, send back an error.
    if(company === '' || role === ''){
        return next(createCustomError("Please provide company name and role title", 400))
    }
    const job = await Job.findOneAndUpdate(
        { _id:jobID, createdBy:userID},
        req.body,
        {runValidators:true, returnDocument:'after'}
    )
    if(!job){
        return next(createCustomError(`No job with ID: ${jobID}`, 400))
    }
    res.status(200).json({job})
}

//Delete job with a specific id and return it.
const deleteJob = async(req, res) => {
    const {user:{userID}, params: {id:jobID}} = req
    const job = await Job.findOneAndDelete({
        _id:jobID,
        createdBy:userID
    })
    if(!job){
        return next(createCustomError(`No job with ID: ${jobID}`, 400))
    }
    res.status(200).json({msg: `Job ${jobID} was deleted`})
}


module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
}