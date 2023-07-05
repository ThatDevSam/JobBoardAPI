const Job = require('../models/jobs')
const {createCustomError} = require('../errors/customError')
const mongoose = require('mongoose')
const moment = require('moment')

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
    const {search, status, jobType, sort} = req.query

    //Only show jobs that were created by the user doing the search.
    const queryObject = {
        createdBy: req.user.userID
    }

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
    res.status(200).json({ jobs, totalJobs, numOfPages });
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

const showStats = async (req, res) => {
    //Find the jobs created by the user current logged in, and group them by their status.
    let stats = await Job.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    //reformat stats to be an object with status as the key and count as the value.
    stats = stats.reduce((accumlator, currentItem) => {
      const { _id: title, count } = currentItem;
      accumlator[title] = count;
      return accumlator;
    }, {});
    const defaultStats = {
      applied: stats.applied || 0,
      underconsideration: stats.underconsideration || 0,
      interview: stats.interview || 0,
      pending: stats.pending || 0,
      declined: stats.declined || 0,
    };
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
    ]);

    //Reformat the date, and reverse the order of the months, so the later months appear at the end of the array.
    monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y');
      return { date, count };
    })
    .reverse();

    res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
}


module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    showStats,
}