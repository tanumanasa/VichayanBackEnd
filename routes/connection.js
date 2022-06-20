const express = require('express')
const router = express.Router()
const passport = require('passport')

const {getAllConnections, sendConnectionRequest, 
    acceptConnectionRequest, ignoreConnectionRequest, getAllConnectionRequest} = require('../controller/connection')


//GET ALL CONNECTIONS
router.get('/', passport.authenticate('jwt', { session: false }), getAllConnections)

//SEND CONNECTION REQUEST
router.get('/send/:id', passport.authenticate('jwt', { session: false }), sendConnectionRequest)

//ACCEPT CONNECTION REQUEST
router.get('/accept/:id', passport.authenticate('jwt', { session: false }), acceptConnectionRequest)

//GET ALL CONNECTION REQUEST
router.get('/request', passport.authenticate('jwt', { session: false }), getAllConnectionRequest)

//IGNORE CONNECTION REQUEST
router.get('/ignore/:id', passport.authenticate('jwt', { session: false }), ignoreConnectionRequest)


module.exports = router