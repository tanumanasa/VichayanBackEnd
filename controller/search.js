const User = require('../model/user');
const Post = require('../model/post');
const Article = require('../model/article');

const globalSearch = async (req, res) => {
    try {
        const result = {};
        const { collection, searchString } = req.body;
        if (!collection) {
            result.users = await User.find({ $text: { $search: searchString } }).limit(10);
            result.posts = await Post.find({ $text: { $search: searchString } }).limit(10);
            result.articles = await Article.find({ $text: { $search: searchString } }).limit(10);
        } else {
            switch (collection) {
                case 'users':
                    result.users = await User.find({ $text: { $search: searchString } }).limit(10);
                    break;
                case 'posts':
                    result.posts = await Post.find({ $text: { $search: searchString } }).limit(10);
                    break;
                case 'articles':
                    result.articles = await Article.find({ $text: { $search: searchString } }).limit(10);
                    break;
                default:
                    return res.status(404).json({
                        success: false,
                        message: 'Invalid collection',
                        response: {}
                    })
            }
        }
        return res.status(200).json({
            success: true,
            message: 'Results fetched',
            response: result
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

module.exports = {
    globalSearch
}