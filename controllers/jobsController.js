const Job = require('../models/jobsModel')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const mongoose = require('mongoose')
const moment = require('moment')
const { checkUserPermission } = require('../utils')

//Function that takes in a job ID and returns the job object if it exists in the db.
const getSingleJob = async(req, res, next) => {
    const {id:jobID} = req.params

    //Find the job in the db with the matching jobID.
    const job = await Job.findOne({
        _id:jobID,
    })
    
    //If the job is not found in the db thorw this error.
    if(!job){
        throw new CustomError.NotFoundError(`No job with id: ${productID}`)
    }

    //If the job is found, return it.
    res.status(StatusCodes.OK).json({ product });
}

//This controller supports the job search feature.
//It takes in search requirements and returns an array of jobs that match. 
const getAllJobs = async(req, res) => {
    //Desctructure the search criteria from the request.
    const {search, status, jobType, sort} = req.query

    //This object will hold the search criteria that will be submitted to the db.
    const queryObject = {}

    //If these search options are present, add them to the queryObject
    if (search) {
      queryObject.position = { $regex: search, $options: 'i' };
    }
    if (status && status !== 'all') {
      queryObject.status = status;
    }
    if (jobType && jobType !== 'all') {
      queryObject.jobType = jobType;
    }
    //Find jobs that match the the search parameters
    let result = Job.find(queryObject);

    //Add sort options to the result.
    if (sort === 'recent') {
        result = result.sort('-createdAt');
    }
    if (sort === 'oldest') {
      result = result.sort('createdAt');
    }
    if (sort === 'a-z') {
      result = result.sort('position');
    }
    if (sort === 'z-a') {
      result = result.sort('-position');
    }

    //Paganation to limit the amout of data being passed to the front end.
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit);

    //Apply sort, and paganation to the query result.
    const jobs = await result;

    //Count the number of jobs that matched the query.
    const totalJobs = await Job.countDocuments(queryObject);
    //Determine the total number of pages.
    const numOfPages = Math.ceil(totalJobs / limit);
    //Return the jobs, and other info to the client.
    res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
}

//Function that creates a new job post.
const createJob = async(req, res) => {
    //assign the userID value to the job.createdBy property.
    req.body.createdBy = req.user.userID
    //create the job.
    const job = await Job.create({...req.body})
    //Return the new job to the client.
    res.status(StatusCodes.CREATED).json({job})
}

//Update a specific job, and return the new job to the user.
const updateJob = async(req, res, next) => {
    const {
        params: {id:jobID},
        body:{company, role, salaryRange, descrp},
    } = req

    //If the company and role fields are empty, send back an error.
    if(company === '' || role === ''){
        return next(createCustomError("Please provide company name and role title", 400))
    } 

    // req.body,
    //     {runValidators:true, returnDocument:'after'}

    //Find the document that matches the parameters, update it with the content in req.body, and return the new document after it has been updated. 
    const job = await Job.findOne({ _id:jobID})

    //If the job is not found throw a not found error.
    if(!job){
        throw new CustomError.NotFoundError(`There is no job with id: ${productID}`)
    }

    //Check that the user requesting the job is the user that owns it. If they do not, the checkUserPermission function will throw its own error.
    checkUserPermission(req.user, job.createdBy)

    //update the job fields
    job.company  = company
    job.role = role
    job.salaryRange = salaryRange
    job.description = descrp

    //save the new info to the db.
    await job.save()

    //If the job does exist return it to the client.
    res.status(StatusCodes.OK).json({job})
}

//Delete job with a specific id.
const deleteJob = async(req, res) => {
    //Get the jobID from the request parameters.
    const {id:jobID} = req.params

    //Find a the job with the jobID that was also created by the requesting user.
    const job = await Job.findOne({_id:jobID})

    //If the job does not exist throw an error.
    if(!job){
        throw new CustomError.NotFoundError(`There is no job with id: ${jobID}`)
    }

    //Check that the user requesting the job is the user that owns it. If they do not, the checkUserPermission function will throw its own error.
    checkUserPermission(req.user, job.createdBy)

    //If the user has permission, delete the job.
    await job.deleteOne()

    res.status(StatusCodes.OK).json({msg: `Job ${jobID} was deleted`})
}

//This controller provides some metrics to companies about the job posting activity.
//Specifically, it provides the total amount of jobs for each job status and it shows how many jobs were created over the last 6 months.
const showStats = async (req, res) => {
    //Find the jobs created by the user and group them by their status.
    let stats = await Job.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    //reformat stats to be an object with status as the key and count as the value.
    stats = stats.reduce((accumlator, currentItem) => {
      const { _id: title, count } = currentItem;
      accumlator[title] = count;
      return accumlator
    }, {});

    //Get the current status for each job status category or set it to 0.
    const defaultStats = {
      applied: stats.applied || 0,
      underconsideration: stats.underconsideration || 0,
      interview: stats.interview || 0,
      pending: stats.pending || 0,
      declined: stats.declined || 0,
    }

    //Find the last 6 months worth of jobs.
    let monthlyApplications = await Job.aggregate([
      //Find the jobs created by the user.
      { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
      {
          //Group the jobs by year, month, and then sum them.
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      //Sort them in reverse order.
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      //Get the last 6 months.
      { $limit: 6 },
    ])

    //Reformat the date, and reverse the order of the months, so the later months appear at the end of the array.
    monthlyApplications = monthlyApplications
    .map((app) => {
      const {
        _id: { year, month },
        count,
      } = app;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y');
      return { date, count };
    })
    .reverse()

    //return the total number of jobs for each status (defaultStats) and the number of jobs per month over the last 6 months (monthlyApplications).
    res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications })
}


module.exports = {
    getAllJobs,
    getSingleJob,
    createJob,
    updateJob,
    deleteJob,
    showStats,
}