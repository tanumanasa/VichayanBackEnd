const { ObjectId } = require('mongodb')

//Models
const User = require('../model/user')
const Connection = require('../model/connection')
const ConnectionRequest = require('../model/connectionRequest')

const sendConnectionRequest = async (req, res, next) => {
    try {
        const { id } = req.params
        const senderId = req.user._id
        //Check whether connection already exist or not
        const isConnectionExist = await Connection.findOne({ $or: [{ user1: ObjectId(senderId) }, { user2: ObjectId(senderId) }] })
        if (isConnectionExist) {
            //Return connection already exist
            return res.status(409).json({ message: "Connection already exist", success: false, response: {} })
        }
        const isAlreadySent = await ConnectionRequest.findOne({ $and: [{ sender: ObjectId(senderId) }, { receiver: ObjectId(id) }] })
        if (isAlreadySent) {
            //Return connectionRequest already exist
            return res.status(409).json({ message: "Connection already sent", success: false, response: {} })
        }
        const newConnectionRequest = await new ConnectionRequest({
            sender: ObjectId(senderId),
            receiver: ObjectId(id),
            status: "sent"
        })
        await newConnectionRequest.save()
        return res.status(200).json({ message: "Connection sent successfully", success: true, response: newConnectionRequest })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

const acceptConnectionRequest = async (req, res, next) => {
    try {
        const { id } = req.params
        const receiverId = req.user._id
        const isConnectionExist = await Connection.findOne({ $or: [{ user1: ObjectId(receiverId) }, { user2: ObjectId(receiverId) }] })
        if (isConnectionExist) {
            //Return connection already exist
            return res.status(409).json({ message: "Connection already exist", success: false, response: {} })
        }
        const connectionRequest = await ConnectionRequest.findById(ObjectId(id))
        //Validate connectionRequest
        if (connectionRequest && connectionRequest.receiver.toString() == receiverId.toString()) {
            connectionRequest.status = 'received'
            await connectionRequest.save()
        }
        else {
            return res.status(400).json({ success: false, message: "Invalid Request" })
        }
        //Create new Connection
        const newConnection = await new Connection({
            user1: connectionRequest.sender,
            user2: connectionRequest.receiver
        })
        await newConnection.save()
        //Delete connectionRequest 
        await ConnectionRequest.findByIdAndDelete(ObjectId(id))
        return res.status(200).json({ message: "Connection request accepted successfully", success: true, response: newConnection })
    }
    catch (error) {
        console.log("Error",error)
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

const getAllConnections = async (req, res, next) => {
    try {
        const { id } = req.params
        const connections = await Connection.find({ $or: [{ user1: ObjectId(id) }, { user2: ObjectId(id) }]}).populate('user1 user2')
        return res.status(200).json({ message: `${connections.length} connections found`, success: true, response:connections })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message})
    }
}

const ignoreConnectionRequest = async (req, res, next) => {
    try {
        const { id } = req.params
        const connectionRequest = await ConnectionRequest.findById(ObjectId(id))
        console.log("connectionRequest", connectionRequest)
        if (!connectionRequest){
            return res.status(400).json({ message: "Invalid Connection", success: false, response: {}})
        }
        if (connectionRequest.receiver.toString() != req.user._id.toString()){
            return res.status(400).json({ message: "Invalid Request", success: false, response: {}})
        }
        connectionRequest.status = 'ignored'
        await connectionRequest.save()
        return res.status(200).json({ message: "Connection ignored successfully", success: true, response: connectionRequest })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

module.exports = {
    sendConnectionRequest,
    acceptConnectionRequest,
    getAllConnections,
    ignoreConnectionRequest
}
