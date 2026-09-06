const express = require('express');
const router = express.Router();
const { getSuburbs, getSuburbByName } = require('../controllers/suburbController');

router.get('/', getSuburbs);
router.get('/:name', getSuburbByName);

module.exports = router;
