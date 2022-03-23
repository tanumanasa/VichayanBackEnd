const Experience = require('../model/experience')
const { ObjectId } = require('mongodb')


module.exports = {
    addExperience: async (req, res, next) => {
        try {
            const { _id } = req.user
            const { title, employmentType, company, location, startDate, endDate, userName, isPresent, description } = req.body
            const _isPresent = await Experience.findOne({ $and: [{ title }, { employmentType }, { company }, { startDate }, { userName }] })
            if (_isPresent) {
                return res.status(400).json({ success: false, message: "experience already added", response: {} })
            }
            const experience = await new Experience({
                title,
                employmentType,
                company,
                location,
                startDate,
                endDate,
                isPresent,
                userName,
                description,
                createdBy: _id
            })
            await experience.save()
            return res.status(200).json({ success: true, message: "experience created successfully", response: experience })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    getExperience: async (req, res, next) => {
        try {
            const { id } = req.params
            const experience = await Experience.findById(id)
            if (!experience) {
                return res.status(404).json({ success: false, message: "Invalid id, experience not found", response: {} })
            }
            return res.status(200).json({ success: true, message: "experience found", response: experience })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    getExperiences: async (req, res, next) => {
        try {
            const { _id } = req.user
            const experiences = await Experience.find({ createdBy: ObjectId(_id) })
            return res.status(200).json({ success: true, message: `${experiences.length} found`, response: experiences })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    updateExperience: async (req, res, next) => {
        try {
            const { id } = req.params
            const { title, employmentType, company, location, startDate, endDate, isPresent, description } = req.body
            const experience = await Experience.findById(ObjectId(id))
            if (!experience) {
                return res.status(404).json({ success: false, message: "Invalid id, experience not found", response: {} })
            }
            if (experience.createdBy.toString() !== req.user._id.toString()) {
                return res.status(400).json({ success: false, message: "Invalid Request, unauthorized", response: {} })
            }
            if (title) {
                experience.title = title
            }
            if (employmentType) {
                experience.employmentType = employmentType
            }
            if (company) {
                experience.company = company
            }
            if (location) {
                experience.location = location
            }
            if (startDate) {
                experience.startDate = startDate
            }
            if (endDate) {
                experience.endDate = endDate
            }
            if (isPresent) {
                experience.isPresent = isPresent
            }
            if (description) {
                experience.description = description
            }
            await experience.save()
            return res.status(200).json({ success: true, message: "experience updated successfully", response: experience })
        }
        catch (error) {
            console.log("Error", error)
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    deleteExperience: async (req, res, next) => {
        try {
            const { id } = req.params
            const experience = await Experience.findByIdAndDelete(id)
            if (!experience) {
                return res.status(404).json({ success: false, message: "Invalid id, post not found", response: {} })
            }
            return res.status(200).json({ success: true, messsage: "Post Deleted successfully", response: experience })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    }
}