const { s3, getSignedUrl, deleteFileFromS3 } = require("../utils/s3");
const Story = require('../model/story');

const addStroy = async(req, res) => {
    try {
        const {id: userId} = req.user;
        const {caption} = req.body;
        let story;
        if(req.file){
            let url = getSignedUrl(req.file.key);
            story = {
                originalname: req.file.originalname,
                url: url,
                key: req.file.key
            };
        }
        const newStory = await Story.create({
            userId,
            caption,
            story
        });
        return res.status(201).json({
            success: true,
            message: 'Story added successfully',
            response: newStory
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

const getStory = async(req, res) => {
    try {
        const {storyId} = req.params;
        const story = await Story.findById(storyId);
        if(!story){
            return res.status(404).json({
                success: false,
                message: 'No story found with provided storyId',
                response: {}
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Story fetched successfully',
            response: story
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

const getAllStories = async(req, res) => {
    try {
        const {userId} = req.params;
        const stories = await Story.find({userId});
        return res.status(200).json({
            success: true,
            message: 'Stories fetched successfully',
            response: stories
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

const deleteStory = async(req, res) => {
    try {
        const {id} = req.user;
        console.log("🚀 ~ id", id)
        const {storyId} = req.params;
        const story = await Story.findOneAndDelete({_id: storyId, userId: id});
        if(!story){
            return res.status(404).json({
                success: false,
                message: 'No story found with provided storyId',
                response: {}
            });
        }
        deleteFileFromS3({ key: story.story.key }, (d) => {
            if (d.success === false) {
              console.log("Error occured in delete file from s3", d.error);
            } else {
              console.log("Successfully deleted from s3 bucket");
            }
          });
        return res.status(200).json({
            success: true,
            message: 'Story deleted successfully',
            response: story
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

module.exports = {
    addStroy,
    getStory,
    getAllStories,
    deleteStory
};