const express = require('express')
const router = express.Router()
const passport = require('passport')

const {getAllConnections, sendConnectionRequest, 
    acceptConnectionRequest, ignoreConnectionRequest} = require('../controller/connection')


//GET ALL CONNECTIONS
router.get('/:id', passport.authenticate('jwt', { session: false }), getAllConnections)

//SEND CONNECTION REQUEST
router.get('/send/:id', passport.authenticate('jwt', { session: false }), sendConnectionRequest)

//RECEIVE CONNECTION REQUEST
router.get('/accept/:id', passport.authenticate('jwt', { session: false }), acceptConnectionRequest)

//IGNORE CONNECTION REQUEST
router.get('/ignore/:id', passport.authenticate('jwt', { session: false }), ignoreConnectionRequest)


module.exports = router