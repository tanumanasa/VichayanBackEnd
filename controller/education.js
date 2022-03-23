const Education = require('../model/education')
const { ObjectId } = require('mongodb')

module.exports = {
    addEducation: async (req, res, next) => {
        try {
            const { _id } = req.user
            const { school, degree, userName, fieldOfStudy, grade, startDate, endDate, isPresent, description} = req.body
            const _isPresent = await Education.findOne({ $and: [{ school }, { degree }, {fieldOfStudy}, { startDate }, { userName }] })
            if (_isPresent) {
                return res.status(400).json({ success: false, message: "education already added", response: {} })
            }
            const education = await new Education({
                school,
                degree,
                fieldOfStudy,
                grade,
                startDate,
                endDate,
                isPresent,
                userName,
                description,
                createdBy: _id
            })
            await education.save()
            return res.status(200).json({ success: true, message: "Education added successfully", response: education })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    getEducation: async (req, res, next) => {
        try {
            const { id } = req.params
            const education = await Education.findById(id)
            if (!education) {
                return res.status(404).json({ success: false, message: "Invalid id, education not found", response: {} })
            }
            return res.status(200).json({ success: true, message: "education found", response: education })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    getEducations: async (req, res, next) => {
        try {
            const { _id } = req.user
            const educations = await Education.find({ createdBy: ObjectId(_id) })
            return res.status(200).json({ success: true, message: `${educations.length} found`, response: educations })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    updateEducation: async (req, res, next) => {
        try {
            const { id } = req.params
            const { school, degree, fieldOfStudy, grade, startDate, endDate, isPresent, description} = req.body
            const education = await Education.findById(id)
            if (!education) {
                return res.status(404).json({ success: false, message: "Invalid id, education not found", response: {} })
            }
            if (education.createdBy.toString() !== req.user._id.toString()) {
                return res.status(400).json({ success: false, message: "Invalid Request, unauthorized", response: {} })
            }
            if (school) {
                education.text = text
            }
            if(degree){
                education.degree = degree
            }
            if(fieldOfStudy){
                education.fieldOfStudy = fieldOfStudy
            }
            if(grade){
                education.grade = grade
            }
            if(startDate){
                education.startDate = startDate
            }
            if(endDate){
                education.endDate = endDate
            }
            if(isPresent){
                education.isPresent = isPresent
            }
            if(description){
                education.description = description
            }
            await education.save()
            return res.status(200).json({ success: true, message: "education updated successfully", response: education })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    deleteEducation: async (req, res, next) => {
        try {
            const { id } = req.params
            const education = await Education.findByIdAndDelete(id)
            if (!education) {
                return res.status(404).json({ success: false, message: "Invalid id, education not found", response: {} })
            }
            return res.status(200).json({ success: true, messsage: "education Deleted successfully", response: education })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    }
}