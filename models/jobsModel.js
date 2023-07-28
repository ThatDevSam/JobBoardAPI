const mongoose = require('mongoose')

//Job post model.
const JobSchema = new mongoose.Schema({
    company: {
        type: String, 
        required:[true, 'Please provide company name.'],
        maxLength: 100,
    },
    role: {
        type: String, 
        required:[true, 'Please provide role title.'],
        maxLength: 100,
    },
    status: {
        type: String,
        enum: ['applied', 'underconsideration', 'interview', 'pending', 'declined'],
        default: 'pending'
    },
    type: {
        type: String,
        enum: ['full-time', 'part-time', 'remote', 'intership'],
        default: 'full-time',
    },
    location: {
        type: String,
        default: 'United States',
        required: [true, 'Please provide a job location'],
    },
    salaryRange:{
        type:String,
        required: [true, 'Please provide a salary range'],
        maxLength: 25,
    },
    description:{
        type:String,
        required: [true, 'Please provide a job descritpion.'],
        maxLength: 350,
    },
    createdBy: {
        //This ties the job post to the user that created it.
        type: mongoose.Types.ObjectId, 
        ref: 'User',
        required: [true, 'Please provide a user']
    }
}, {timestamps: true}) //Manages the createdAt and updatedAt fields of the document.

module.exports = mongoose.model('Job', JobSchema)