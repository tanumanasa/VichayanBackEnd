const { ObjectId } = require('mongodb')

//Models
const User = require('../model/user')
const Connection = require('../model/connection')

const sendConnectionRequest = async (req, res, next) => {
    try {
        const { id } = req.params
        const senderId = req.user._id
        //Check whether connection already exist or not
        let isConnectionExist = await Connection.findOne({ $and: [{ createdBy: ObjectId(senderId) }, { recievedBy: ObjectId(id) }] })
        if (isConnectionExist) {
            //Return connection already exist
            return res.status(409).json({ message: "Connection already exist", success: false, response: {} })
        }

        isConnectionExist = await Connection.findOne({ $and: [{ recievedBy: ObjectId(senderId) }, { createdBy: ObjectId(id) }] })
        if (isConnectionExist) {
            //Return connection already exist
            return res.status(409).json({ message: "Connection already exist", success: false, response: {} })
        }

        const newConnectionRequest = await new Connection({
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

        const connectionRequest = await Connection.findById(ObjectId(id))
        //Validate connectionRequest
        if (connectionRequest && connectionRequest.recievedBy.toString() == receiverId.toString()) {
            connectionRequest.status = 'accepted'
            await connectionRequest.save()
        }
        else {
            return res.status(400).json({ success: false, message: "Invalid Request" })
        }

        return res.status(200).json({ message: "Connection request accepted successfully", success: true, response: newConnection })
    }
    catch (error) {
        console.log("Error",error)
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

const getAllConnections = async (req, res, next) => {
    try {
        const { id } = req.user._id
        const connections = await Connection.find({ $and: [
            { $or: [{ createdBy: ObjectId(id) }, { recievedBy: ObjectId(id) }]},
            { status: 'accepted' }
        ]}).populate('createdBy recievedBy')
        return res.status(200).json({ message: `${connections.length} connections found`, success: true, response:connections })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message})
    }
}

const getAllConnectionRequest = async (req, res, next) => {
    try {
        const { id } = req.user._id
        const connections = await Connection.find({ $and: [
            { $or: [{ recievedBy: ObjectId(id) }]},
            { status: 'sent' }
        ]}).populate('createdBy recievedBy')
        return res.status(200).json({ message: `${connections.length} connections Recieved`, success: true, response:connections })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message})
    }
}

const ignoreConnectionRequest = async (req, res, next) => {
    try {
        const { id } = req.params
        const receiverId = req.user._id
        
        const connectionRequest = await Connection.findById(ObjectId(id))
        if (!connectionRequest){
            return res.status(400).json({ message: "Invalid Connection", success: false, response: {}})
        }
        if (connectionRequest.receiver.toString() != receiverId.toString()){
            return res.status(400).json({ message: "Invalid Request", success: false, response: {}})
        }
        connectionRequest.status = 'ignored'
        await connectionRequest.save()
        return res.status(200).json({ message: "Connection ignored successfully", success: true })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

module.exports = {
    sendConnectionRequest,
    acceptConnectionRequest,
    getAllConnections,
    getAllConnectionRequest,
    ignoreConnectionRequest
}
