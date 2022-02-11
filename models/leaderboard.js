var mongoose = require("mongoose");

const leaderBoardSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        ref: "users",
        index: true
    },
    points:{
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model("leaderBoard", leaderBoardSchema);