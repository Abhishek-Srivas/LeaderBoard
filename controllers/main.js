const User = require("../models/users");
const LeaderBoard = require("../models/leaderboard");
var mongoose = require("mongoose");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");

const redisClient = require("../helpers/redis");

exports.search = async (req, res, next) => {
  try {
    const name = "western_tern";
    const _id = "62052529b084d64e34b934fb";
    const detail = await User.find({ name });
    res.json(detail);
  } catch (err) {
    res.json(err);
  }
};

exports.addUser = async (req, res, next) => {
  try {
    // const { name } = req.body;
    // const newUser = await User.create(name);
    // await res.status(201).json({ success: true, data: "User Added" });

    // Inserting 10K users
    const data = [];
    for (let i = 0; i < 10000; i++) {
      const randomName = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
      });
      data.push({ name: randomName });
    }
    const createdUsers = await User.insertMany(data);
    console.log(createdUsers);
    leaderBoardData = [];
    createdUsers.forEach((userData) => {
      leaderBoardData.push({ id: userData._id });
    });
    const Ldata = await LeaderBoard.insertMany(leaderBoardData);
    console.log(Ldata);
    res.status(201).json({ success: true, data: "User Added" });
  } catch (err) {
    next(err);
  }
};

exports.updatePoints = async (req, res, next) => {
  try {
    const { user } = req.query;
    const { newPoint } = req.body;

    const newRecord = await LeaderBoard.findOneAndUpdate(
      { id: user },
      {
        $inc: { points: newPoint },
      },
      { new: true }
    ).populate('id');
    
    console.log(newRecord);
    const name = newRecord.id.name;
    const newPoints = newRecord.points;
    const value = name+':'+JSON.stringify(newPoints);
    console.log(value);
    // const client = await redisClient();
    redisClient.then(async (client) => {
      const updatedKey = await client.ZADD("abc",{score:newPoints,value:user});
      res.json(updatedKey);
    });
  } catch (err) {
    console.log(err);
  }
};
