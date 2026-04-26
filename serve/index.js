import path from 'path';
import fs from 'fs';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import {
  createUser,
  authenticateUser
} from './auth/index.js';

import { router as birds } from './router/birds.js';
import { createSolutionsRouter } from './router/solutions.js';
import { 
  logger, 
  morganMiddleware, 
  requestIdMiddleware, 
  requestLoggerMiddleware 
} from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let config;
try {
  config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
} catch (e) {
  console.error("Failed to load config:", e.message);
  process.exit(1);
}

const app = express();
app.use(morganMiddleware);  // 使用 morgan 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

const solutionsRouter = createSolutionsRouter(path.join(config.solution_root, "repo"));
app.use('/solutions', solutionsRouter);

app.get('/about', (req, res) => {
  res.json({ ver: 'ver1.0.0' })
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!config.user[username]) {
    return res.status(401).end('Not such user');
  }

  const isValid = await authenticateUser(config.user[username], password);
  if (!isValid) return res.status(401).end('Unauthorized');

  res.status(200).json({
    success: true,
    time: new Date().toISOString(),
    username: username,
    role: config.user[username].role,
    solutionname: config.solution_name,
  });
})

app.use('/birds', birds)

app.get('/db', (req, res) => {
  res.status(200).json({ user: 'tobi' })
});

app.post('/debug', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'No request body' });
  }

  const { cmd, param } = req.body;
  let msg;

  if (cmd === 'updateRowHeader_text') {
    msg = updateRowHeader_text(param.id, param.text);
  } else if (cmd === 'updateSlotCell') {
    msg = updateSlotCell(param.id, param.slot, param.text, param.style);
  } else if (cmd === 'row_defaultSlot') {
    msg = await row_defaultSlot(param.slot);
  } else if (cmd === 'row_defaultAllSlot') {
    msg = await row_defaultAllSlot(param.tick);
  } else {
    return res.status(400).json({ error: 'Unknown command' });
  }

  res.send(msg).status(200);
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

