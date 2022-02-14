const express = require("express")
const router = express.Router()
const mainController = require('../controllers/main')

router.use('/adduser',mainController.addUser);
router.use('/testing',mainController.search);
router.use('/update-points',mainController.addToCache);
router.get("/leaderboard",mainController.getLeaderboard);
router.get("/dummyData",mainController.dummyData);
router.get("/top10",mainController.getTopTen);

module.exports = router;