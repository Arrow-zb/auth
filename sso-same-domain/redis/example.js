const redis = require('redis');

const client = redis.createClient(6379, "10.12.6.144");

client.set("hello", 'this is hello value');

client.get("hello", (err, v) => {
  console.log('redis get:', v);
});

client.del("hello")
client.del("8bfe7774-3c52-41b0-9d1f-5cd613381705")
client.del("996833b2-1f12-4d53-b884-07794bee4798")