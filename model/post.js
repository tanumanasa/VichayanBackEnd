const mongoose = require('mongoose')
const { Schema } = mongoose

const postSchema = new Schema({
    text:{
        type: String
    },
    images: [],
    docs: [],
    websitesLink:[],
    privacy:{
        type: String,
        enum:['private', 'public', 'connections']
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt:{
        type: Date,
        default: Date.now 
    },
    likesCount: {
        type:Number,
        default: 0
    }
}/*,{strict:false}*/);
postSchema.index({text: 'text'});

module.exports = mongoose.model('post', postSchema)


