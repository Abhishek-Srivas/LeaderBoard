const express = require("express")
const router = express.Router()
const mainController = require('../controllers/main')

router.use('/adduser',mainController.addUser);
router.use('/update-points',mainController.addToCache);
router.get("/top10",mainController.getTopTen);
router.post("/addPoint",mainController.increScore);

module.exports = router;