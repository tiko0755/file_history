// getDirectories.js
import { readdir, readFile, writeFile, access, stat, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import crypto from 'crypto';
import path from 'node:path';

/**
 * 异步获取指定路径下的所有子目录名称
 * @param {string} dirPath - 要读取的目录路径
 * @returns {Promise<string[]>} 返回子目录名称数组，如果读取失败则返回空数组
 */
const getDirectories = async (dirPath) => {
  try {
    const items = await readdir(dirPath, { withFileTypes: true });
    const directories = items
      .filter(item => item.isDirectory())
      .map(item => item.name);
    
    return directories;
  } catch (error) {
    console.error('读取文件夹失败:', error);
    return [];
  }
}

async function getGitRepositories(dirPath) {
  try {
    const items = await readdir(dirPath, { withFileTypes: true });
    const gitRepos = [];
    
    for (const item of items) {
      if (item.isDirectory()) {
        const gitPath = join(dirPath, item.name, '.git');
        
        // 检查 .git 目录是否存在
        try {
          await access(gitPath);
          gitRepos.push(item.name);
        } catch {
          // 不是 Git 仓库，跳过
        }
      }
    }
    
    return gitRepos;
  } catch (error) {
    console.error('读取文件夹失败:', error);
    return [];
  }
}

async function readFilesByType(root, repo, extensions) {
  const folderPath = path.join(root, repo);
  console.log('readFilesByType.folderPath:', folderPath);
  const extList = Array.isArray(extensions) ? extensions : [extensions];
  const normalizedExts = extList.map(ext => ext.startsWith('.') ? ext : `.${ext}`);
  //console.log('normalizedExts:', normalizedExts);
  try {
    const files = await readdir(folderPath)
    const targetFiles = [];
    for (const file of files) {
      const filePath = join(folderPath, file);
      const stats = await stat(filePath);
      
      if (!stats.isDirectory()) {
        targetFiles.push(file);
      }
    }
    //console.log('targetFiles:', targetFiles);
    
    const results = await Promise.all(
      targetFiles.map(async (file) => {
        //console.log('Processing file:', file);
        const filePath = join(folderPath, file);
        // 始终读取为 Buffer
        const buffer = await readFile(filePath)
        // 基于 Buffer 计算 MD5
        const hash = crypto.createHash('md5').update(buffer).digest('hex');
        // 尝试判断是否为文本文件
        let content = undefined;
        let isText = false;
        try {
          const ext = extname(file);
          if(normalizedExts.includes(ext)){
            // 尝试解码为 UTF-8 文本
            content = buffer.toString('utf-8');
            // 简单检查是否为有效文本（可根据需要调整）
            isText = !content.includes('\uFFFD'); // 没有替换字符
          }
        } catch (e) {
          content = undefined;  //buffer.toString('base64'); // 降级为 base64
        }
        
        return { 
          filePath: filePath.replace(root + path.sep, ''), // 相对于 root 的路径
          content, 
          hash,
          size: buffer.length,
          isText
        };
      })
    );
    
    return results;
  } catch (error) {
    console.error('读取文件失败:', error);
    throw error;
  }
}

async function updateFile(root, repo, filePath, content) {
  const fn = path.join(root, repo, filePath);
  console.log('readFilesByType.folderPath:', fn);
  try {
    // 确保目录存在,如果不存在则返回异常
    const stats = await stat(fn);
    if (stats.isDirectory()) {
      throw new Error(`Cannot write to directory: ${fn}`);
    }
    // 如果 content 是对象且文件扩展名是 .json，则格式化为 JSON 字符串
    if (typeof content === 'object' && path.extname(fn) === '.json') {
      content = JSON.stringify(content, null, 2);
    }
    await writeFile(fn, content, 'utf-8');
    console.log('Successfully saved:', fn);
  } catch (error) {
    console.error('读取文件失败:', error);
    throw error;
  }
}

export { getDirectories, getGitRepositories, readFilesByType, updateFile };


// 使用示例
// const dirs = await getDirectories('./myFolder');
// console.log('所有文件夹:', dirs);