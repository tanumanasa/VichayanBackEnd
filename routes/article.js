const express = require('express')
const router = express.Router()
const passport = require('passport')
const {upload} = require('../utils/s3')

const { createArticle, getArticle, getArticles, 
    updateArticle, deleteArticle} = require('../controller/article')


//CREATE ARTICLE
router.post('/', passport.authenticate('jwt', { session: false }), 
 upload.fields([{name:'images', maxCount:5}]), createArticle)

//GET ARTCILE
router.get('/:id',passport.authenticate('jwt', { session: false }), getArticle)

//GET ARTICLES
router.get('/',passport.authenticate('jwt', { session: false }), getArticles)

//UPDATE ARTICLE
router.put('/:id',passport.authenticate('jwt', { session: false }),
upload.fields([{name:'images', maxCount:5},{name:"docs", maxCount:5}]), updateArticle)

//UPDATE ARTICLE
router.delete('/:id',passport.authenticate('jwt', { session: false }),  deleteArticle)


module.exports = router