const Koa = require('koa');
const app = new Koa();
const koaStatic = require('koa-static');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const router = new Router();
const jsonwebtoken = require('jsonwebtoken');
const jwtAuth = require('koa-jwt');
const SECRET = 'arrow-secret';

const userCollection = {      // 模拟数据库，用户信息
  'arrow': '123456'
}

app.use(koaStatic("views"));
app.use(bodyParser());

app.use(function (ctx, next) {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.body = {
        code: "401",
        msg: err.originalError ? err.originalError.message : err.message
      };
    } else {
      throw err;
    }
  });
});

router.post('/login', (ctx, next) => {
  const { username, password } = ctx.request.body;
  if(userCollection[username] && userCollection[username] === password) {
    ctx.body = {
      code: "0",
      msg: '登录成功',
      token: jsonwebtoken.sign(
        { username: username },  // 加密userToken
        SECRET,
        { expiresIn: '1h' }
      )
    }
  }else {
    ctx.body = {
      code: "401",
      msg: '用户不存在或者密码错误！'
    }
  }
});

router.get("/getUserInfo", jwtAuth({
  secret: SECRET
}), ctx => {
  console.log(ctx.state.user);
  ctx.body = {
    code: "0",
    msg: '获取成功',
    data: ctx.state.user
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods());

const port = 6090;
app.listen(port, err => {
  if(err) throw err;
  console.log(`app start at ${port}`);
});