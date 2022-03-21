let mongoose = require("mongoose");
let Schema = mongoose.Schema;

// Request model.
const Request = new Schema(
    {
        sender:
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        receiver:
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        isAccepted: {
            type: Boolean,
            default: false
        },
        isReject: {
            type: Boolean,
            default: false
        },
      
    },
    { timestamps: true }
);

module.exports = mongoose.model("Request", Request);

