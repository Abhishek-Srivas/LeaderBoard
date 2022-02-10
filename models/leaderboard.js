var mongoose = require("mongoose");

const leaderBoardSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        ref: "users"
    },
    points:{
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model("leaderBoard", otpSchema);