import express from 'express';
import fs from 'node:fs/promises';
import path, { format } from 'node:path';
import { getGitRepositories, updateFile } from '../utils/fs_utils.js';  // 注意：需要包含文件扩展名
import { 
  repoTop, 
  commit, 
  status, 
  switchToExistingBranch, 
  createAndSwitchBranch, 
  branch, 
  mergeBranches,
  currentBranch
} from '../utils/git_utils.js';  // 注意：需要包含文件扩展名

export const createSolutionsRouter = (solution_root) => {
  const router = express.Router()
  // middleware that is specific to this router
  const timeLog = (req, res, next) => {
    console.log('Time: ', Date.now())
    console.log('solution_root:', solution_root);
    next()
  }
  router.use(timeLog)

  // 获取所有解决方案的名字
  router.get('/', async (req, res, next) => {
    try {
      const dirs = await getGitRepositories(solution_root);
      res.status(200).json(dirs);
    } catch (error) {
      next(error); // 传递给错误处理中间件
    }
  });

  // 获取当前所有的解决方案的内容
  router.get('/top', async (req, res, next) => {
    const types = req.query.types ? req.query.types.split(',') : [".json"];
    //console.log('/top.types:', types);
    try {
      const dirs = await getGitRepositories(solution_root);
      const repoInfos = await Promise.all(dirs.map(async (dir) => {
        return await repoTop(solution_root, dir, types);
      }));
      try{
        repoInfos.forEach(repo => {
          //console.log('repo:', repo);
          repo.files.forEach(item => {
              if(item.filePath.endsWith('.json')){
                item.content = JSON.parse(item.content);
              }
          })
        })
      }catch(err){
        console.error('解析 solution.json 失败:', err);
      }
      res.status(200).json(repoInfos);
    } catch (error) {
      next(error); // 传递给错误处理中间件
    }
  })

  // 获取当前所有的解决方案的内容
  router.post('/addchanges', async (req, res, next) => {
    console.dir(req.query);
    console.dir(req.body);
    const gitRepo = req.query.repo;
    try {
      // 假设 req.body 是一个数组
      const files = Array.isArray(req.body) ? req.body : [req.body];
      for (let file of files) {
        console.log('Saving file:', file.name);
        await updateFile(solution_root, gitRepo, file.name, file.content);
      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/commit', async (req, res, next) => {
      try {
          // 日志记录
          console.log('Query params:', req.query);
          console.log('Body:', req.body);
          console.log('Body type:', typeof req.body);
          
          const { repo } = req.query;
          
          if (!repo) {
              return res.status(400).json({ error: 'Missing repo parameter' });
          }
          
          // 解析请求体
          let bodyObj = req.body;
          
          // 如果 body 是字符串，尝试解析为 JSON
          if (typeof req.body === 'string') {
              try {
                  bodyObj = JSON.parse(req.body);
              } catch (err) {
                  return res.status(400).json({ 
                      error: 'Invalid JSON format',
                      message: err.message 
                  });
              }
          }
          
          // 安全地获取参数（修复运算符问题）
          const files = bodyObj?.files ?? ".";
          const message = bodyObj?.message ?? "这家伙很懒";
          
          // 调用 commit 函数
          const status = await commit(solution_root, repo, files, message);
          
          // 返回成功响应
          res.status(200).json({
              success: true,
              data: status,
              commit: {
                  files,
                  message,
                  repo
              }
          });
          
      } catch (error) {
          console.error('Commit endpoint error:', error);
          res.status(500).json({
              success: false,
              error: 'Failed to commit changes',
              message: error.message
          });
          next(error);
      }
  });

  router.get('/status', async (req, res, next) => {
      try {
          // 日志记录
          console.log('Query params:', req.query);
          const { repo } = req.query;
          if (!repo) {
              return res.status(400).json({ error: 'Missing repo parameter' });
          }
          // 调用 status 函数
          const status = await gitStatus(solution_root, repo);
          
          // 返回成功响应
          res.status(200).json({
              success: true,
              data: status,
          });
          
      } catch (error) {
          console.error('Commit endpoint error:', error);
          res.status(500).json({
              success: false,
              error: 'Failed to commit changes',
              message: error.message
          });
          next(error);
      }
  });

  router.get('/switchbranch', async (req, res, next) => {
    try {
        // 日志记录
        console.log('Query params:', req.query);
        const { repo, branch } = req.query;
        if (!repo) {
            return res.status(400).json({ error: 'Missing repo parameter' });
        }
        // 调用 status 函数
        const status = await switchToExistingBranch(solution_root, repo, branch);
        
        // 返回成功响应
        res.status(200).json({
            success: true,
            data: status,
        });
        
    } catch (error) {
        console.error('Commit endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to commit changes',
            message: error.message
        });
        next(error);
    }
  });

  router.get('/createandswitchbranch', async (req, res, next) => {
    try {
        // 日志记录
        console.log('Query params:', req.query);
        const { repo, branch } = req.query;
        if (!repo) {
            return res.status(400).json({ error: 'Missing repo parameter' });
        }
        // 调用 status 函数
        const status = await createAndSwitchBranch(solution_root, repo, branch);
        
        // 返回成功响应
        res.status(200).json({
            success: true,
            data: status,
        });
        
    } catch (error) {
        console.error('Commit endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to commit changes',
            message: error.message
        });
        next(error);
    }
  });

  router.get('/branch', async (req, res, next) => {
    try {
        // 日志记录
        console.log('Query params:', req.query);
        const { repo } = req.query;
        if (!repo) {
            return res.status(400).json({ error: 'Missing repo parameter' });
        }
        // 调用 status 函数
        const status = await currentBranch(solution_root, repo);
        
        // 返回成功响应
        res.status(200).json({
            success: true,
            data: status,
        });
        
    } catch (error) {
        console.error('Commit endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to commit changes',
            message: error.message
        });
        next(error);
    }
  });

  router.get('/mergebranches', async (req, res, next) => {
    try {
        // 日志记录
        console.log('/mergebranches, Query params:', req.query);
        const { repo, from, to } = req.query;
        if (!repo) {
            return res.status(400).json({ error: 'Missing repo parameter' });
        }
        const status = await mergeBranches(solution_root, repo, from, to);
        // 返回成功响应
        res.status(200).json({
            success: true,
            data: status,
        });
    } catch (error) {
        console.error('mergebranches endpoint error:', error);
        res.status(500).json({
            success: false,
            error: `Failed to merge ${to} from ${main}`,
            message: error.message
        });
        next(error);
    }
  });

  router.get('/currentbranch', async (req, res, next) => {
    try {
        // 日志记录
        console.log('Query params:', req.query);
        const { repo } = req.query;
        if (!repo) {
            return res.status(400).json({ error: 'Missing repo parameter' });
        }
        // 调用 status 函数
        const status = await currentBranch(solution_root, repo);
        
        // 返回成功响应
        res.status(200).json({
            success: true,
            data: status,
        });
        
    } catch (error) {
        console.error('Commit endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to commit changes',
            message: error.message
        });
        next(error);
    }
  });












  // 获取当前所有的解决方案的内容
  router.post('/save', async (req, res, next) => {
    console.dir(req.query);
    console.dir(req.body);
    
    try {
      // 假设 req.body 是一个数组
      const files = Array.isArray(req.body) ? req.body : [req.body];
      
      for (let file of files) {
        console.log('Saving file:', file.filePath);
        
        try {
          let content = file.content;
          
          // 如果是 JSON 文件且内容是对象，则格式化
          if (file.filePath.endsWith('.json') && typeof file.content === 'object') {
            content = JSON.stringify(file.content, null, 2);
          }
          
          // 1. 提取并创建目录（recursive: true 会自动创建层级）
          const dir = path.dirname(file.filePath);
          console.log('dir:', dir);
          await fs.mkdir(dir, { recursive: true });

          await fs.writeFile(file.filePath, content, 'utf-8');
          console.log('Successfully saved:', file.filePath);
          
        } catch (fileErr) {
          console.error('Error saving file:', file.filePath, fileErr);
          // 可以选择继续或抛出错误
        }
      }
      
      res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/new', async (req, res, next) => {
      console.dir(req.query);
      console.dir(req.body);
      try {
          const dir = path.join(solution_root, req.query.name);
          console.log('Creating directory:', dir);
          await fs.mkdir(dir, { recursive: true });
          const filePath = path.join(dir, 'solution.json');
          // 将对象转为 JSON 字符串
          const jsonContent = JSON.stringify(req.body, null, 2); // 使用 2 空格缩进，便于阅读
          await fs.writeFile(filePath, jsonContent, 'utf-8');
          console.log('Successfully created file:', filePath);
          res.status(200).json({ success: true });
      } catch (error) {
          console.error('Error processing request:', error);
          res.status(500).json({ success: false, error: error.message });
      }
  });


  // 获取当前指定解决方案的历史内容
  router.get('/history', async (req, res, next) => {
    res.send('History birds')
  })

  return router;
}



