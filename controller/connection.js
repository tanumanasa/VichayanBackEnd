const { ObjectId } = require('mongodb')

//Models
const User = require('../model/user')
const Connection = require('../model/connection')
const Notification = require('../model/notification')

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
            if(isConnectionExist.status === "blocked"){
                return res.status(409).json({message: "You are blocked by the user", success: false, response: {}});
            }
            //Return connection already exist
            return res.status(409).json({ message: "Connection already exist", success: false, response: {} })
        }

        const newConnectionRequest = await new Connection({
            createdBy: ObjectId(senderId),
            recievedBy: ObjectId(id),
            status: "sent"
        })
        await newConnectionRequest.save()

        const newNotificationRequest = await new Notification({
            type: "ConnectionRecieved",
            message: "Send you connection Request",
            userId: ObjectId(id),
            createdBy: ObjectId(senderId)
        })

        await newNotificationRequest.save()
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

        const connectionRequest = await Connection.findOne({_id: id, status: 'sent'})
        //Validate connectionRequest
        if (connectionRequest && connectionRequest.recievedBy.toString() == receiverId.toString()) {
            connectionRequest.status = 'accepted'
            await connectionRequest.save()

            const newNotificationRequest = await new Notification({
                type: "ConnectionAccept",
                message: "Accepted your connection Request",
                userId: ObjectId(id),
                createdBy: ObjectId(receiverId)
            })
    
            await newNotificationRequest.save()
        }
        else {
            return res.status(400).json({ success: false, message: "Invalid Request" })
        }

        return res.status(200).json({ message: "Connection request accepted successfully", success: true, response: {} })
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
            { $or: [{status: 'accepted'}, {status: 'blocked'}] }
        ]}).populate('createdBy recievedBy')
        return res.status(200).json({ message: `${connections.length} connections found`, success: true, response:connections })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message})
    }
}

const getAllConnectionRequest = async (req, res, next) => {
    try {
        const id = req.user._id
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

const getAllConnectionSend = async (req, res, next) => {
    try {
        const { id } = req.user._id
        const connections = await Connection.find({ $and: [
            { $or: [{ createdBy: ObjectId(id) }]},
            { status: 'sent' }
        ]}).populate('createdBy recievedBy')
        return res.status(200).json({ message: `${connections.length} connections Sent`, success: true, response:connections })
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
        if (connectionRequest.recievedBy.toString() != receiverId.toString()){
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

const blockConnection = async(req, res) => {
    try {
        const {id} = req.params;
        const {_id} = req.user;
        const createdConnection = await Connection.findOneAndDelete({ $and: [{ createdBy: ObjectId(id) }, { recievedBy: ObjectId(_id) }] })
        const recievedConnection = await Connection.findOneAndDelete({ $and: [{ createdBy: ObjectId(_id) }, { recievedBy: ObjectId(id) }] })
        const connection = new Connection({
            createdBy: _id,
            recievedBy: id,
            status: 'blocked'
        });
        await connection.save();
        return res.status(200).json({
            success: true,
            message: "User blocked successfully",
            response: connection
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

const unblockConnection = async(req, res) => {
    try {
        const {id} = req.params;
        const {_id} = req.user;
        const connection = await Connection.findOneAndDelete({createdBy:_id, recievedBy:id, status: 'blocked'});
        if(!connection){
            return res.status(500).json({
                success: false,
                message: "Block not found",
                response: {}
            })
        }
        return res.status(200).json({
            success: true,
            message: "User unblocked successfully",
            response: connection
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = {
    sendConnectionRequest,
    acceptConnectionRequest,
    getAllConnections,
    getAllConnectionRequest,
    getAllConnectionSend,
    ignoreConnectionRequest,
    blockConnection,
    unblockConnection
}
