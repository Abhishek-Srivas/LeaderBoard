const redis = require("redis");

async function createRedisClient() {
  
  const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  });
  client.auth(process.env.REDIS_PASSWORD);
  client.on("error", (err) => console.log("Error connecting to REDIS: ", err));
  client.on("connect", () => console.log("Connected to REDIS!"));
  
 // await client.connect();
  return client;
}

module.exports = createRedisClient();
