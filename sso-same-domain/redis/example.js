const redis = require('redis');

const client = redis.createClient(6379, "10.12.6.144");

client.set("hello", 'this is hello value');

client.get("hello", (err, v) => {
  console.log('redis get:', v);
});