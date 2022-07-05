const Chat = require('../model/chat')

const chatCreation = async (req, res, next) => {
    try {
        const { id } = req.params
        const senderId = req.user._id

        const newChatCreated = await new Chat({
            sender: ObjectId(senderId),
            receiver: ObjectId(id),
            status: "sent"
        })
        await newChatCreated.save()
        return res.status(200).json({ message: "Chat created successfully", success: true, response: newChatCreated })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

module.exports = {
    chatCreation
}
