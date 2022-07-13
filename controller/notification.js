const Notification = require('../model/notification')
const { v4: uuidv4 } = require('uuid')

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

    getNotification: async (req, res, next) => {
        try {
          const {_id} = req.user
          const countNotification = await Notification.find({userId:_id}).count()
          const notifications = await Notification.find({userId:_id})
          return res.status(200).json({success:true, message:`${notifications.length} notifications found`, response: notifications, count: countNotification})
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
}