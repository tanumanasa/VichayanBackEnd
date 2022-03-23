const mongoose = require('mongoose')
const { Schema } = mongoose

const educationSchema = new Schema({
    school:{
        type: String
    },
    degree:{
        type: String
    },
    fieldOfStudy:{
        type: String
    },
    grade:{
        type: String
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

module.exports = mongoose.model('education', educationSchema)