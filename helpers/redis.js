const redis = require("redis");
async function createRedisClient() {
  
  const client = redis.createClient({
    host: "redis-11308.c257.us-east-1-3.ec2.cloud.redislabs.com",
    port: 11308
  });
  client.auth("7sdK7T3giFw0WOPnGTIQSPqhQrTLCIID");
  client.on("error", (err) => console.log("Error connecting to REDIS: ", err));
  client.on("connect", () => console.log("Connected to REDIS!"));

 // await client.connect();
  return client;
}

module.exports = createRedisClient();
