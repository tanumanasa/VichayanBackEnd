const express = require('express')
const router = express.Router()
const passport = require('passport')

const { addExperience, getExperience, getExperiences, updateExperience, deleteExperience
} = require('../controller/experience')


//CREATE EXPERIENCE
router.post('/', passport.authenticate('jwt',{ session: false }),addExperience)

//GET EXPERIENCE
router.get('/single/:id', passport.authenticate('jwt', { session: false }), getExperience)

//GET EXPERIENCES
router.get('/', passport.authenticate('jwt', { session: false }), getExperiences)

//UPDATE EXPERIENCE
router.put('/:id', passport.authenticate('jwt', { session: false }), updateExperience)

//DELETE EXPERIENCE
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteExperience)


module.exports = router