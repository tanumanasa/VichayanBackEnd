const express = require('express')
const router = express.Router()
const passport = require('passport')

const { addEducation, getEducation, getEducations, updateEducation, deleteEducation
} = require('../controller/education')


//CREATE EDUCATION
router.post('/', passport.authenticate('jwt',{ session: false }),addEducation)

//GET EDUCATION
router.get('/single/:id', passport.authenticate('jwt', { session: false }), getEducation)

//GET EDUCATIONS
router.get('/', passport.authenticate('jwt', { session: false }), getEducations)

//UPDATE EDUCATION
router.put('/:id', passport.authenticate('jwt', { session: false }), updateEducation)

//DELETE EDUCATION
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteEducation)


module.exports = router