const express = require("express")
const router = express.Router()
const mainController = require('../controllers/main')

router.use('/adduser',mainController.addUser);
router.use('/testing',mainController.search);
router.use('/update-points',mainController.updatePoints);
router.get("/leaderboard",mainController.getLeaderboard);

module.exports = router;