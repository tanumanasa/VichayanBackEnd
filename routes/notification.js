const express = require('express')
const router = express.Router()
const passport = require('passport')

const { getNotification, getNotifications, updateNotification} = require('../controller/notification')


//GET NOTIFICATION
router.get('/:id',passport.authenticate('jwt', { session: false }), getNotification)

//GET NOTIFICATIONS
router.get('/',passport.authenticate('jwt', { session: false }), getNotifications)

//UPDATE ARTICLE
router.put('/:id',passport.authenticate('jwt', { session: false }), updateNotification)

module.exports = router