const redis = require("redis");
const bluebird = require("bluebird");
bluebird.promisifyAll(redis);
async function createRedisClient() {
  
  const client = redis.createClient({
    host: "redis-10732.c283.us-east-1-4.ec2.cloud.redislabs.com",
    port: 10732
  });
  client.auth("VkcSnM64IxdUK4PKsI3aSoSiL3ZCKKZG");
  client.on("error", (err) => console.log("Error connecting to REDIS: ", err));
  client.on("connect", () => console.log("Connected to REDIS!"));

 // await client.connect();
  return client;
}

module.exports = createRedisClient();
