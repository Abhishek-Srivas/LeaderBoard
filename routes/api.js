const express = require("express")
const router = express.Router()
const mainController = require('../controllers/main')

router.use('/leaderboard',mainController.rndm);
router.use('/update-points',mainController.rndm);

module.exports = router;