const mongoose = require('mongoose')
const { Schema } = mongoose

const experienceSchema = new Schema({
    title:{
        type: String
    },
    employmentType:{
        type: String
    },
    company:{
        type: String
    },
    location:{
        type: Object
    },
    startDate:{
        type: Date
    },
    endDate:{
        type: Date
    },
    isPresent:{
        type: Boolean,
        default:false
    },
    description:{
        type: String
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        index:true
    },
    userName:{
        type: String
    },
    createdAt:{
        type: Date,
        default: Date.now 
    }
})

module.exports = mongoose.model('experience', experienceSchema)