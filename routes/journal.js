const express = require('express');
const passport = require('passport');
const { addJournal, getJournal, getJournals, deleteJournal, updateJournal } = require('../controller/journal');
const { upload } = require('../utils/s3');

const router = express.Router();

router.post('/', passport.authenticate('jwt', { session: false }), 
upload.fields([{name: 'documents', maxCount: 5}]), addJournal);

router.get('/:journalId', passport.authenticate('jwt', {session: false}), getJournal);

router.delete('/:journalId', passport.authenticate('jwt', {session: false}), deleteJournal);

router.get('/', passport.authenticate('jwt', {session: false}), getJournals);

router.put('/:journalId', passport.authenticate('jwt', {session: false}),
upload.fields([{name: 'documents', maxCount: 5}]), updateJournal);

module.exports = router;