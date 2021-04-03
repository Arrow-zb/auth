const Koa = require('koa');
const app = new Koa();
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
  store: redisStore({ client })
}

app.use(session(SESS_CONFIG, app));

router.get("/", ctx => {
  const { userInfo } = ctx.session;
  if(userInfo) {          // 已登录
    ctx.body = `<h1>WELCOM TO ${ctx.hostname}, I am ${ userInfo.username }</h1>`
  }else {            // 未登录，重定向到 sso
    ctx.redirect(`http://sso.arrow.cn:6090/?service=${ctx.href}`)
  } 
})

app
  .use(router.routes())
  .use(router.allowedMethods());

const port = 6092;
app.listen(port, err => {
  if(err) throw err;
  console.log(`app start at ${port}`);
});