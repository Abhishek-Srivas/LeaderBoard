const User = require("../models/users");
const LeaderBoard = require("../models/leaderboard");
var mongoose = require("mongoose");
//convert to async
const { promisify } = require("util");
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

    redisClient.then(async (client) => {
      const zadd = promisify(client.zadd).bind(client);
      const hmset = promisify(client.hmset).bind(client);
      const result = await hmset(user, "name", newRecord.id.name);
      const data = await zadd("leaderboard", JSON.stringify(newRecord.points), user);

      return res.json(data);
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    redisClient.then(async (client) => {
      const zrevrange = promisify(client.zrevrange).bind(client);
      const hgetall = promisify(client.hgetall).bind(client);
      let rank = []
      const data = await zrevrange("leaderboard", 0, -1, 'withscores');
      for (let i=0;i<data.length;i+=2)
      {
        const user_details = await hgetall(data[i]);
        rank.push({
          name : user_details.name,
          id : data[i],
          score : data[i+1],
          rank : Math.floor((i+1)/2)+1
        })
      }
      return res.json(rank);
    })
  } catch (error) {
    next(error)
  }
};

exports.getTopTen = async(req,res,next)=>{
  try {
    
  } catch (error) {
    next(error);
  }
};
