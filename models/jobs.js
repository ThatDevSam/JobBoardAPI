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
    createdBy: {
        //This ties the job post to the user that created it.
        type: mongoose.Types.ObjectId, 
        ref: 'User',
        required: [true, 'Please provide a user']
    }
}, {timestamps: true}) //Manages the createdAt and updatedAt fields of the document.

module.exports = mongoose.model('Job', JobSchema)