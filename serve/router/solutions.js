import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getGitRepositories, readFilesByType } from '../utils/fs_utils.js';  // 注意：需要包含文件扩展名
import { repoTop } from '../utils/git_utils.js';  // 注意：需要包含文件扩展名


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
        return await repoTop(path.join(solution_root,dir), types);
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

  // 获取当前指定解决方案的历史内容
  router.get('/history', async (req, res, next) => {
    res.send('History birds')
  })

  return router;
}



