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
const { get } = require("http");

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
      const tt = await leaderboard
        .find()
        .populate("id")
        .limit(40000)
        .skip(60000);
      console.log(1);
      pt = [];
      for (let i = 0; i < 40000; i += 1) {
        const t1 = zadd(
          "leaderboard",
          JSON.stringify(tt[i].points),
          tt[i].id.id
        );
        const t2 = hmset(tt[i].id.id, "name", tt[i].id.name);
        const t3 = zadd(
          "score",
          JSON.stringify(tt[i].points),
          JSON.stringify(tt[i].points)
        );
        pt.push(t1);
        pt.push(t2);
        pt.push(t3);
      }
      console.log(2);
      await Promise.all(pt);
      console.log(3);

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
      const data = await zrevrange("leaderboard", 0, 10, "withscores");
      return res.json(data);
    });
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

      const t4 = zrevrange("leaderboard", 0, 9, "withscores");
      const t5 = zrevrange("leaderboard", 0, 9);
      const [user_score, user_name, ranks, userids] = await Promise.all([
        t1,
        t2,
        t4,
        t5,
      ]);
      const xd = zrevrank("score", user_score);
      const data = [];
      let startRank = 1,
        pre = -1;
      for (let i = 0; i < ranks.length; i += 2) {
        if(pre==-1) pre=ranks[i+1];
        if (pre != ranks[i + 1]) startRank += 1;
        data.push({
          rank: startRank,
          userid: ranks[i],
          score: ranks[i + 1],
        });
        pre = ranks[i + 1];
      }
      const names = await Promise.all(
        userids.map((id) => {
          return hget(id, "name");
        })
      );
      const user_rank = await xd;
      //console.log(data);
      const results = names.map((name, index) => ({
        name: name,
        score: data[index].score,
        rank: data[index].rank,
        userid: data[index].userid,
      }));
      res.json({
        results,
        user_name,
        user_score,
        user_rank: user_rank + 1,
      });
    });
  } catch (error) {
    next(error);
  }
};

exports.increScore = async (req, res, next) => {
  try {
    const { user } = req.query;
    const { score } = req.body;

    redisClient.then(async (client) => {

      const ZINCRBY = promisify(client.zincrby).bind(client);
      const INCR = promisify(client.incr).bind(client);
      const DECR = promisify(client.decr).bind(client);
      const GET = promisify(client.get).bind(client);
      const ZADD = promisify(client.zadd).bind(client);
      const ZREM = promisify(client.zrem).bind(client);
      const updateScorePromise = LeaderBoard.findOneAndUpdate(
        { id: user },
        { $inc: { points: score } },
        { new: true }
      );

      const t1 = ZINCRBY("leaderboard", score, user);

      const [updatedScore, updatedLeaderBoardSet] = await Promise.all([
        updateScorePromise,
        t1
      ]);

      const updatedPoints = updatedScore.points;
      const oldPoints = updatedPoints - score


      const a1 = INCR(updatedPoints);
      const a2 = ZADD("score", updatedPoints, updatedPoints);
      const a3 = GET(oldPoints);
      const [new_key, new_set, freq] = await Promise.all([
        a1,
        a2,
        a3
      ]);
      console.log(freq);
      console.log(oldPoints);
      if (freq === '1') {
        await ZREM("score", oldPoints)
      }
      if (oldPoints != 0) {
        await DECR(oldPoints);
      }


      res.json({
        updatedScore,
        updatedLeaderBoardSet,
      });
    });
  } catch (error) {
    next(error);
  }
};
