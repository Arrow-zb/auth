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
  signed: false,
  sameSite: false,
  store: redisStore({ client })
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
    // ctx.cookies.set('aa', 'aa', {
    //   sameSite:
    // })
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

router.get('/check', async (ctx, next) => {
  const sessionId = ctx.cookies.get(SESS_CONFIG.key);
  console.log(ctx.href, sessionId);
  ctx.type = "application/javascript";
  let res = {
    code: "401",
    msg: '您还未登陆，请登录！'
  };
  if(sessionId && await client.get(sessionId)) {
    res = {
      code: "0",
      data: sessionId
    }
  }
  ctx.body = `${ctx.query.callback}(${JSON.stringify(res)})`;
});

router.post('/logout', async (ctx, next) => {
  const sessionId = ctx.cookies.get(SESS_CONFIG.key);
  if(sessionId && await client.get(sessionId)) {
    client.del(sessionId);
    ctx.status = 200;
    ctx.body = {
      code: '0',
      msg: '注销成功'
    }
  }else {
    ctx.status = 200;
    ctx.body = {
      code: '401',
      msg: '用户未登录，请登录！',
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