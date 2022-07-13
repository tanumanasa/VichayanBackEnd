const Notification = require('../model/notification')

module.exports = {

    getNotification: async (req, res, next) => {
        try {
            const {id} = req.params
            const notification = await Notification.findById(id)
            if (! notification){
                return res.status(404).json({success:false, message:"Invalid id, notification not found", response:{}})
            }
            return res.status(200).json({success:true, message:"Notification found", response:notification})
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },

    getNotifications: async (req, res, next) => {
        try {
          const {_id} = req.user
          const notifications = await Notification.find({userId:_id})
          return res.status(200).json({success:true, message:`${notifications.length} notifications found`, response: notifications})
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },

    updateNotification: async (req, res, next) => {
        try {
            const { id } = req.params
            const userId = req.user._id
    
            const notificationRequest = await Notification.findById(ObjectId(id))
            //Validate connectionRequest
            if (notificationRequest && notificationRequest.isSeen !== true) {
                connectionRequest.isSeen = true;
                connectionRequest.updatedBy = ObjectId(userId)
                await connectionRequest.save()
            }
            else {
                return res.status(400).json({ success: false, message: "Invalid Request" })
            }
    
            return res.status(200).json({ message: "Notification is read", success: true, response: {} })
        }
        catch (error) {
            console.log("Error",error)
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    }
}