const redis = require("redis");

async function createRedisClient() {
  const client = redis.createClient("redis-11308.c257.us-east-1-3.ec2.cloud.redislabs.com:11308",{
    password: "7sdK7T3giFw0WOPnGTIQSPqhQrTLCIID",
  });
  client.on("error", (err) => console.log("Error connecting to REDIS: ", err));
  client.on("connect", () => console.log("Connected to REDIS!"));

  await client.connect();
  return client;
}

module.exports = createRedisClient();
