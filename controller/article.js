const Article = require('../model/article')
const {s3,getSignedUrl,deleteFileFromS3} = require('../utils/s3')
const { v4: uuidv4 } = require('uuid')

module.exports = {
    createArticle: async (req, res, next) => {
        try {
            const { id } = req.user
            let images = []
            if (req.files.images.length > 0) {
                for (var i = 0; i < req.files.images.length; i++) {
                    let url = getSignedUrl(req.files.images[i].key)
                    images.push({
                        id:uuidv4(),
                        originalname: req.files.images[i].originalname,
                        url:url,
                        key: req.files.images[i].key
                    })
                }
            }
            const { text, link } = req.body
            const newArticle = await new Article({
                text,
                images,
                link,
                createdBy: id
            })
            await newArticle.save()
            return res.status(201).json({ success: true, message: "Article created successfully", response: newArticle })
        }
        catch (error) {
            console.log("errror", error)
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    getArticle: async (req, res, next) => {
        try {
            const {id} = req.params
            const article = await Article.findById(id)
            if (! article){
                return res.status(404).json({success:false, message:"Invalid id, article not found", response:{}})
            }
            return res.status(200).json({success:true, message:"Article found", response:article})
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    getArticles: async (req, res, next) => {
        try {
          const {id} = req.user
          const articles = await Article.find({createdBy:id})
          return res.status(200).json({success:true, message:`${articles.length} articles found`, response: articles})
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    updateArticle: async (req, res, next) => {
        try {
            const {id} = req.params
            let images = []
            if (req.files.images.length > 0) {
                for (var i = 0; i < req.files.images.length; i++) {
                    let url = s3.getSignedUrl('getObject', {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: req.files.images[i].key
                    })
                    images.push({
                        id:uuidv4(),
                        originalname: req.files.images[i].originalname,
                        url:url
                    })
                }
            }
            const { text, link } = req.body
            const article = await Article.findById(id)
            if (! article){
                return res.status(404).json({success:false, message:"Invalid id, article not found", response:{}})
            }
            if(text){
                article.text = text
            }
            if(images.length > 0){
                article.images = images
            }
            if(link){
                article.link = link
            }
            await article.save()
            return res.status(200).json({success:true, message:"Article updated successfully", response: article})
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    deleteArticle: async (req, res, next) => {
        try {
            const {id} = req.params
            const article = await Article.findByIdAndDelete(id)
            if (! article){
                return res.status(404).json({success:false, message:"Invalid id, article not found", response:{}})
            }
            for (var i = 0; i< article.images.length; i++){
                deleteFileFromS3({key:article.images[i].key},(d)=>{
                    if (d.success === false){
                        console.log("Error occured in delete file from s3", d.error)
                    }
                    else{
                        console.log("Successfully delted from s3 bucket")
                    }
                })
            }
            return res.status(200).json({success:true, message:"Article deleted successfully", response: article})
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    }
}