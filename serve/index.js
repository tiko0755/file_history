import path from 'path';
import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取 __dirname 的等价物（ES Module 中没有 __dirname）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log('server.__dirname:', __dirname)
// 导入自定义模块
import {
  createUser,
  authenticateUser
} from './auth/index.js';  // 注意：需要包含文件扩展名

import { router as birds } from './router/birds.js';  // 注意：需要包含文件扩展名
import { router as companysurvey } from './router/companysurvey.js';  // 注意：需要包含文件扩展名
import { createSolutionsRouter } from './router/solutions.js';  // 注意：需要包含文件扩展名

const app = express();

// 中间件配置
app.use(cors()); // 允许跨域
app.use(bodyParser.json()); // 解析 JSON 请求体
app.use(bodyParser.urlencoded({ extended: true })); // 解析表单请求体
app.use(express.json()); // 解析 application/json
app.use(express.urlencoded({ extended: true })); // 解析 application/x-www-form-urlencoded

// 静态文件托管
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'dist/media')));
app.use(express.static(path.join(__dirname, 'public')));

const config = JSON.parse(fs.readFileSync("./config.json"));

const solutionsRouter = createSolutionsRouter(path.join(config.solution_root, "repo"));
app.use('/solutions', solutionsRouter);

app.get('/about', function (req, res) {
  res.json({ ver: 'ver1.0.0' })
});

app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.post('/login', async(req, res) => {
  //console.log('body:', req.body);
  const { username, password } = req.body;

  const confObj = JSON.parse(fs.readFileSync("./config.json"));
  //console.log('config:', confObj);

  if(!confObj.user[username]){
    res.status(401).end('Not such user');
  }
  else{
    let isValid = await authenticateUser(confObj.user[username], password);
    console.log('Password valid:', isValid); // true
    if(!isValid) res.status(401).end('Unauthorized');
    else {
      // generate solutions
      //let solutions = await fetch_all_solutions("./public/solutions");
      res.status(200).json({
        success: true,
        time: new Date().toISOString(),
        password: password,
        username: username,
        role: confObj.user[username].role,
        solutionname: confObj.solution_name,
        // solutions: solutions
      });
    }
  }
})

app.use('/birds', birds)
app.use('/companysurvey', companysurvey)

app.get('/db', function (req, res) {
  //console.debug('query:', req.query);
  res.status(200).json({ user: 'tobi' })
});

app.post('/debug', async (req, res) =>{
  if (!req.body) {
    return res.status(400).json({ error: 'No request body' });
  }
  const {cmd, param} = {...(req.body||{})};
  if(cmd === 'updateRowHeader_text'){
    const msg = updateRowHeader_text(param.id, param.text);
    res.send(msg).status(200);
  }
  else if(cmd === 'updateSlotCell'){
    const msg = updateSlotCell(param.id, param.slot, param.text, param.style);
    res.send(msg).status(200);
  }
  else if(cmd === 'updateSlotCell'){
    const msg = updateSlotCell(param.id, param.slot, param.text, param.style);
    res.send(msg).status(200);
  }
  else if(cmd === 'row_defaultSlot'){
    const msg = await row_defaultSlot(param.slot);
    res.send(msg).status(200);
  }
  else if(cmd === 'row_defaultAllSlot'){
    const msg = await row_defaultAllSlot(param.tick);
    res.send(msg).status(200);
  }

});

// 404处理 - 必须在所有路由之后
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
  //res.status(404).send('抱歉，找不到您请求的页面');
});

const httpServer = createServer(app);

// 启动服务器
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

