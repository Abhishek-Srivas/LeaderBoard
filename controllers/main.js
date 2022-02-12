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

    redisClient.then(async (client) => {
      //first make a hash of user details
      client.hmset(user,"name",newRecord.id.name,function(err,result){
        if(err)
        {
          console.log(1);
          return res.json(err);
        }
        else
        {
          client.zadd("leaderboard",JSON.stringify(newRecord.points),user,function(err,data){
            if(err)
            {
              console.log(2);
              return res.json(err)
            }
            else
            {
              console.log(3);
              return res.json({
                result,
                data
              })
            }
          })
        }
      })
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    redisClient.then(async (client) => {
      let rank =[]
      client.zrevrange("leaderboard", 0, -1, 'withscores', function (err, result) {
        //console.log(result);
        //build result array
        //user rank object
        const user_data = {
          name : "",
          id : "",
          rank: "",
          score : ""

        }
        for(let i=0;i<result.length;i+=2)
        {
         // console.log(result[i])
          client.hgetall(result[i],function(err,data){
            if(err)
            {
              return res.json(err);
            }
            const user = Object.create(user_data);
            user.name = data.name
            user.id = result[i]
            user.score = result[i+1]
            user.rank = (i/2)+1
            rank.push(user);
            console.log(rank);
          })
        }
        return res.json(rank);
      });
    })
  } catch (error) {
    next(error)
  }
};
