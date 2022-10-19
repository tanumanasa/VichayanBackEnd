const Article = require('../model/article')
const { s3, getSignedUrl, deleteFileFromS3 } = require('../utils/s3')
const { v4: uuidv4 } = require('uuid')
const ArticleLike = require('../model/articleLike')
const Notification = require('../model/notification');
const Tag = require('../model/tag');
const Tagarticlemapping = require('../model/tagarticlemapping');
const { ObjectId } = require("mongodb");


module.exports = {
    createArticle: async (req, res, next) => {
        try {
            const { id } = req.user
            let images = []
            if (req.file) {
                if (req.files.images.length > 0) {
                    for (var i = 0; i < req.files.images.length; i++) {
                        let url = getSignedUrl(req.files.images[i].key)
                        images.push({
                            id: uuidv4(),
                            originalname: req.files.images[i].originalname,
                            url: url,
                            key: req.files.images[i].key
                        })
                    }
                }
            }
            const { text, link } = req.body
            const newArticle = await new Article({
                text,
                images,
                link,
                createdBy: id
            })
            await newArticle.save();
            let { tags } = req.body;
            tags = tags.replace(' ', '').split(',');
            for (var k = 0; k < tags.length; k++) {
                const _tag = await Tag.findOne({ tagName: tags[k] });
                if (_tag) {
                    //map with newly created postid
                    //map post with newly created tag
                    const newTagarticlemapping = new Tagarticlemapping({
                        tagId: _tag._id,
                        articleId: newArticle._id,
                    });
                    await newTagarticlemapping.save();
                } else {
                    //Create new tag
                    const newTag = new Tag({
                        tagName: tags[k],
                        createdBy: ObjectId(_id),
                    });
                    await newTag.save();
                    //map article with newly created tag
                    const newTagarticlemapping = new Tagarticlemapping({
                        tagId: newTag._id,
                        articleId: newArticle._id,
                    });
                    await newTagarticlemapping.save();
                }
            }
            return res.status(201).json({ success: true, message: "Article created successfully", response: newArticle })
        }
        catch (error) {
            console.log("errror", error)
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    getArticle: async (req, res, next) => {
        try {
            const { id } = req.params
            const article = await Article.findById(id)
            if (!article) {
                return res.status(404).json({ success: false, message: "Invalid id, article not found", response: {} })
            }
            return res.status(200).json({ success: true, message: "Article found", response: article })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    getArticles: async (req, res, next) => {
        try {
            const { id } = req.user
            const articles = await Article.find({ createdBy: id })
            return res.status(200).json({ success: true, message: `${articles.length} articles found`, response: articles })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    updateArticle: async (req, res, next) => {
        try {
            const { id } = req.params
            let images = []
            if (req.files.images.length > 0) {
                for (var i = 0; i < req.files.images.length; i++) {
                    let url = s3.getSignedUrl('getObject', {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: req.files.images[i].key
                    })
                    images.push({
                        id: uuidv4(),
                        originalname: req.files.images[i].originalname,
                        url: url
                    })
                }
            }
            const { text, link } = req.body
            const article = await Article.findById(id)
            if (!article) {
                return res.status(404).json({ success: false, message: "Invalid id, article not found", response: {} })
            }
            if (text) {
                article.text = text
            }
            if (images.length > 0) {
                article.images = images
            }
            if (link) {
                article.link = link
            }
            await article.save()
            return res.status(200).json({ success: true, message: "Article updated successfully", response: article })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    deleteArticle: async (req, res, next) => {
        try {
            const { id } = req.params
            const article = await Article.findByIdAndDelete(id)
            if (!article) {
                return res.status(404).json({ success: false, message: "Invalid id, article not found", response: {} })
            }
            for (var i = 0; i < article.images.length; i++) {
                deleteFileFromS3({ key: article.images[i].key }, (d) => {
                    if (d.success === false) {
                        console.log("Error occured in delete file from s3", d.error)
                    }
                    else {
                        console.log("Successfully delted from s3 bucket")
                    }
                })
            }
            return res.status(200).json({ success: true, message: "Article deleted successfully", response: article })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
        }
    },
    likeUnlikeArticle: async (req, res) => {
        try {
            const { id } = req.params;
            const { _id } = req.user;
            const article = await Article.findById(id);
            const currentLikes = article.likesCount;
            const like = await ArticleLike.findOne({
                $and: [{ createdBy: _id }, { articleId: id }],
            }).populate('articleId');
            if (like) {
                await ArticleLike.findByIdAndDelete(like._id);
                article.likesCount = currentLikes - 1;
                await article.save();
                return res
                    .status(200)
                    .json({
                        success: true,
                        messsage: "Article unliked successfully",
                        response: like,
                    });
            }
            const newLike = new ArticleLike({
                articleId: id,
                createdBy: _id,
            })
            await newLike.save();
            article.likesCount = currentLikes + 1;
            await article.save();
            const userId = article.createdBy;
            const newNotificationRequest = new Notification({
                type: "articleLiked",
                message: "Liked an article",
                userId: ObjectId(userId),
                createdBy: ObjectId(_id)
            })

            await newNotificationRequest.save()

            return res
                .status(200)
                .json({
                    success: true,
                    messsage: "Article liked successfully",
                    response: newLike,
                });
        } catch (error) {
            return res
                .status(500)
                .json({
                    success: false,
                    message: "Internal Server Error",
                    error: error.message,
                });
        }
    },
    getTopArticleByInterest: async (req, res) => {
        try {
            const { interest } = req.params;
            const tag = await Tag.findOne({ tagName: interest });
            if (!tag) {
                return res.status(404).json({
                    success: false,
                    message: "No article tagged with given interest",
                    response: {}
                });
            }
            const tagArticleMapping = await Tagarticlemapping.find({ tagId: ObjectId(tag._id) });
            const articles = await Article.find({ _id: tagArticleMapping.map(e => ObjectId(e.articleId)) }).sort({ likesCount: -1 });
            return res.status(200).json({
                success: true,
                message: "Fetched articles with given interest",
                response: articles
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
}