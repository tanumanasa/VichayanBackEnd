const Journal = require("../model/journal")
const { getSignedUrl, deleteFileFromS3 } = require("../utils/s3");
const { v4: uuidv4 } = require('uuid')
const addJournal = async(req, res) => {
    try {
        const { id } = req.user
        let documents = []
        if (req.files) {
            if (req.files.documents.length > 0) {
                for (var i = 0; i < req.files.documents.length; i++) {
                    let url = getSignedUrl(req.files.documents[i].key)
                    documents.push({
                        id: uuidv4(),
                        originalname: req.files.documents[i].originalname,
                        url: url,
                        key: req.files.documents[i].key
                    })
                }
            }
        }
        console.log(documents);
        const {title, coAuthor} = req.body;
        const journal = await Journal.create({
            title, author: id, coAuthor, documents
        });
        return res.status(201).json({
            success: true,
            message: 'Journal posted successfully',
            response: journal
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

const getJournal = async(req, res) => {
    try {
        const {id} = req.user;
        const {journalId} = req.params;
        const journal = await Journal.findOne({_id: journalId, $or: [{author: id}, {coAuthor: id}]});
        if(!journal){
            return res.status(404).json({
                success: true,
                message: 'No journal found with provided journal id',
                response: {}
            })
        }
        return res.status(200).json({
            success: true,
            message: 'Journal fetched successfully',
            response: journal
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

const getJournals = async(req, res) => {
    try {
        const {id} = req.user;
        const journals = await Journal.find({$or: [{author: id}, {coAuthor: id}]});
        return res.status(200).json({
            success: true,
            message: 'Journals fetched successfully',
            response: journals
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

const deleteJournal = async(req, res) => {
    try {
        const {id} = req.user;
        const {journalId} = req.params;
        const journal = await Journal.findOneAndDelete({_id: journalId, $or: [{author: id}, {coAuthor: id}]});
        if(!journal){
            return res.status(404).json({
                success: false,
                message: 'No journal found with provided journalId',
                response: {}
            });
        }
        for(let i=0; i<journal.documents.length; i++){
            deleteFileFromS3(journal.documents[i].key, (d) => {
                if(d.success === false){
                    console.log('An error occurred while deleting file from s3', d.error);
                } else {
                    console.log('Deleted file from s3 successfully');
                }
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Journal deleted successfully',
            response: journal
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

const updateJournal = async(req, res) => {
    try {
        const {id} = req.user;
        const {journalId} = req.params;
        let documents = [];
        const {title} = req.body;
        const update = {
            title
        }
        if (req.files) {
            if (req.files.documents.length > 0) {
                for (var i = 0; i < req.files.documents.length; i++) {
                    let url = getSignedUrl(req.files.documents[i].key)
                    documents.push({
                        id: uuidv4(),
                        originalname: req.files.documents[i].originalname,
                        url: url,
                        key: req.files.documents[i].key
                    })
                }
            }
            update.documents = documents;
        }
        console.log(documents);
        const journal = await Journal.findOneAndUpdate({_id: journalId, $or: [{author: id}, {coAuthor: id}]}, update, {new: true});
        if(!journal){
            return res.status(404).json({
                success: true,
                message: 'Journal not found with provided journalId',
                response: {}
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Journal updated successfully',
            response: journal
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

module.exports = {
    addJournal,
    getJournal,
    getJournals,
    deleteJournal,
    updateJournal
}