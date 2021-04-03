const Koa = require('koa');
const app = new Koa();
const koaStatic = require('koa-static');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const router = new Router();
const session = require('koa-session');
const redis = require('redis');
const redisStore = require('koa-redis');
const redisClient = redis.createClient(6379, '10.12.6.144');
const coRedis = require('co-redis');

const client = coRedis(redisClient);

const SECRET = 'arrow-secret';
app.keys = [SECRET];

// session 配置
const SESS_CONFIG = {
  key: 'arrow:sessionId',
  maxAge: 60 * 60 * 1000,   // 一个小时
  httpOnly: true,
  signed: true,
  store: redisStore({ client }),
  domain: 'arrow.cn'
  // https://github.com/koajs/session/issues/188
}

// 模拟数据库，用户信息
const userCollection = {      
  'arrow': '123456'
}

app.use(koaStatic("views"));
app.use(bodyParser());
app.use(session(SESS_CONFIG, app));

app.use(async (ctx, next) => {
  const keys = await client.keys("*");
  keys.forEach(async key => {
    console.log(key, await client.get(key));
  });
  await next();
});

router.post('/login', (ctx, next) => {
  const { username, password } = ctx.request.body;
  
  if(userCollection[username] && userCollection[username] === password) {
    // 给 arrow.cn 颁发 session， 以及存储到 redis 中
    ctx.session.userInfo = { username };
    ctx.status = 200;
    ctx.body = {
      code: '0',
      msg: '登录成功',
      data: ctx.query       // 这种方式可以前端重定向，也可以后端 ctx.redirect
    }
  }else {
    ctx.status = 200;
    ctx.body = {
      code: '401',
      msg: '用户不存在或者密码错误！',
    }
  }
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const port = 6090;
app.listen(port, err => {
  if(err) throw err;
  console.log(`app start at ${port}`);
});