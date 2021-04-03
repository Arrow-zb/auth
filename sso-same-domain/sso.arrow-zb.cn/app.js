const Koa = require('koa');
const app = new Koa();
const koaStatic = require('koa-static');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const router = new Router();
const jsonwebtoken = require('jsonwebtoken');
const jwt = require('koa-jwt');
const SECRET = 'arrow-secret';

const userCollection = {      // 模拟数据库，用户信息
  'arrow': '123456'
}

app.use(koaStatic("views"));
app.use(bodyParser());
app.use(jwt({ 
  secret: SECRET,
  audience: 'arrow-zb.cn',
  cookie: true 
}).unless({    // 登录接口不需要验证
  path: [/\/login/]
}));

router.post('/login', (ctx, next) => {
  const { username, password } = ctx.request.body;
  if(userCollection[username] && userCollection[username] === password) {
    ctx.body = {
      code: 200,
      msg: '登录成功',
      token: jsonwebtoken.sign(
        { username: username },  // 加密userToken
        SECRET,
        { expiresIn: '1h' }
      )
  }
  }else {
    ctx.status = 401;
    ctx.body = "用户不存在或者密码错误！";
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