const express = require('express')
const router = express.Router()
const passport = require('passport')

const {
    getAllConnections,
    sendConnectionRequest, 
    acceptConnectionRequest,
    ignoreConnectionRequest,
    getAllConnectionSend,
    getAllConnectionRequest,
    blockConnection,
    unblockConnection
} = require('../controller/connection')


//GET ALL CONNECTIONS
router.get('/', passport.authenticate('jwt', { session: false }), getAllConnections)

//SEND CONNECTION REQUEST
router.post('/send/:id', passport.authenticate('jwt', { session: false }), sendConnectionRequest)

//ACCEPT CONNECTION REQUEST
router.put('/accept/:id', passport.authenticate('jwt', { session: false }), acceptConnectionRequest)

//GET ALL CONNECTION REQUEST
router.get('/request', passport.authenticate('jwt', { session: false }), getAllConnectionRequest)

//GET ALL CONNECTION REQUEST SEND
router.get('/sent', passport.authenticate('jwt', { session: false }), getAllConnectionSend)

//IGNORE CONNECTION REQUEST
router.put('/ignore/:id', passport.authenticate('jwt', { session: false }), ignoreConnectionRequest)

//BLOCK CONNECTION
router.put('/block/:id', passport.authenticate('jwt', {session: false}), blockConnection);

//UNBLOCK CONNECTION
router.delete('/unblock/:id', passport.authenticate("jwt", {session: false}), unblockConnection);


module.exports = router