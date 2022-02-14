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
const leaderboard = require("../models/leaderboard");
const promise = require("bluebird/js/release/promise");

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

//added 1 million user
exports.addUser = async (req, res, next) => {
  try {
    // const { name } = req.body;
    // const newUser = await User.create(name);
    // await res.status(201).json({ success: true, data: "User Added" });

    // Inserting 10K users
    const data = [];
    for (let i = 0; i < 100000; i++) {
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
   // console.log(Ldata);
    res.status(201).json({ success: true, data: "User Added" });
  } catch (err) {
    next(err);
  }
};

exports.addToCache = async (req, res, next) => {
  try {
    redisClient.then(async (client) => {
      const zadd = promisify(client.zadd).bind(client);
      const hmset = promisify(client.hmset).bind(client);
      const tt = await leaderboard.find().populate("id").limit(40000).skip(60000);
      console.log(1);
      pt = []
      for (let i = 0; i < 40000; i += 1) {
        const t1 = zadd("leaderboard", JSON.stringify((tt[i].points)), tt[i].id.id);
        const t2 = hmset(tt[i].id.id, "name", tt[i].id.name);
        const t3 = zadd("score", JSON.stringify((tt[i].points)), JSON.stringify((tt[i].points)));
        pt.push(t1);
        pt.push(t2);
        pt.push(t3);
      }
      console.log(2);
      await Promise.all(pt);
      console.log(3)

      return res.json("OK");
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    redisClient.then(async (client) => {
      const zrevrange = promisify(client.zrevrange).bind(client);
      const hmget = promisify(client.hmget).bind(client);
      const zrank = promisify(client.zrank).bind(client);
      let rank = [];
      const data = await zrevrange("leaderboard", 0, 10, 'withscores');
      return res.json(data);
    })
  } catch (error) {
    next(error);
  }
};

exports.dummyData = async (req, res, next) => {
  try {
    const data = [
      {
        rank: 1,
        name: "abc",
        points: "100",
      },
      {
        rank: 1,
        name: "abc",
        points: "100",
      },
      {
        rank: 1,
        name: "abc",
        points: "100",
      },
      {
        rank: 1,
        name: "abc",
        points: "100",
      },
      {
        rank: 1,
        name: "abc",
        points: "100",
      },
      {
        rank: 1,
        name: "abc",
        points: "100",
      },
      {
        rank: 1,
        name: "abc",
        points: "100",
      },
      {
        rank: 1,
        name: "abc",
        points: "100",
      },
      {
        rank: 1,
        name: "abc",
        points: "100",
      },
    ];

    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getTopTen = async (req, res, next) => {
  try {
    const { user } = req.query;
    redisClient.then(async (client) => {

      const zrevrange = promisify(client.zrevrange).bind(client);
      const hget = promisify(client.hget).bind(client);
      const zscore = promisify(client.zscore).bind(client);
      const zrevrank = promisify(client.zrevrank).bind(client);
      const t1 = zscore("leaderboard", user);
      const t2 = hget(user, "name");
      const t3 = zrevrank("score", user);
      const t4 = zrevrange("leaderboard", 0, 9, 'withscores')
      const t5 = zrevrange("leaderboard", 0, 9)
      const [user_score, user_name, user_rank, ranks, userids] = await Promise.all([t1, t2, t3, t4, t5]);
      const data = [];
      let startRank = 1, pre = -1;
      for (let i = 0; i < ranks.length; i += 2) {
        data.push({
          rank: startRank,
          userid: ranks[i], //comapny id
          score: ranks[i + 1],
        });
        if (pre != ranks[i + 1]) startRank += 1;
        pre = ranks[i + 1]
      }
      const names = await Promise.all(userids.map((id) => {
        return hget(id, "name")
      }));
      //console.log(data);
      const results = names.map((name, index) => ({
        name: name,
        score: data[index].score,
        rank: data[index].rank,
        userid: data[index].userid,
      }))
      res.json({
        results,
        user_name,
        user_score,
        user_rank: user_rank + 1
      });
      // const zscore = promisify(client.zscore).bind(client);
      // const zrevrank = promisify(client.zrevrank).bind(client);
      // const rank = []
      // const data = zrevange("leaderboard", 0, 9, 'withscores'); //withscores
      // const data1 = zrange("leaderboard", 0, 10); //only user ids
      // const score = zrange("score", 0, 10); //score 
      // const user_score = zscore("leaderboard", user);
      // const user_name = hmget(user, "name");
      // const [t1, t2, t3, t4, t5] = await Promise.all([data, score, data1, user_score, user_name]);
      // console.log(t4);
      // // console.log(data);
      // const promises = t3.map((userid) => {
      //   //console.log(userid)
      //   return hmget(userid, "name")
      // });
      // const names = await Promise.all(promises);
      // //console.log(names)
      // return res.json({
      //   data: t1, score: t2, names: names, user: {
      //     name: t5[0],
      //     score: t4,
      //     id: user
      //   }
      // });
    })
  } catch (error) {
    next(error);
  }
};
