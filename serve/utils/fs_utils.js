// getDirectories.js
import { readdir, readFile, writeFile, access, stat, mkdir, copyFile } from 'node:fs/promises';
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
  //console.log('readFilesByType.folderPath:', folderPath);
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
          let ext = extname(file).trim();
          if(normalizedExts.includes(ext)){
            // 简单检查是否为有效文本（可根据需要调整）
            isText = true; 
            // 尝试解码为 UTF-8 文本
            content = buffer.toString('utf-8');
            //console.log('content:', content);
            if(ext.toLowerCase().indexOf(".json") >= 0){
              content = JSON.parse(content);
            }
          }
        } catch (e) {
          content = undefined;  //buffer.toString('base64'); // 降级为 base64
        }
        
        return { 
          name: filePath.replace(root + path.sep, '').replace(repo + path.sep, ''), // 相对于 root 的路径
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

/**
 * 更新或创建文件
 * @param {string} root - 根目录
 * @param {string} repo - 仓库名称
 * @param {string} filePath - 文件路径（相对于 repo）
 * @param {string|object} content - 文件内容
 */
async function updateFile(root, repo, filePath, content) {
  // 拼接完整文件路径
  const fn = path.join(root, repo, filePath);
  console.log('updateFile.fn:', fn);
  
  // 确保父目录存在，不存在则创建
  const dir = path.dirname(fn);
  await access(dir).catch(async () => {
    await mkdir(dir, { recursive: true });
  });
  
  // 检查文件是否存在
  try {
    const stats = await stat(fn);
    // 如果是文件夹，抛出异常
    if (stats.isDirectory()) {
      throw new Error(`Cannot write to directory: ${fn}`);
    }
  } catch (error) {
    // 如果文件不存在（ENOENT），忽略错误，继续创建文件
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  
  // 如果 content 是对象且文件扩展名是 .json，则格式化为 JSON 字符串
  console.log('typeof content:', typeof content, 'extname:', extname(fn));
  if (typeof content === 'object' && path.extname(fn) === '.json') {
    content = JSON.stringify(content, null, 2);
  }
  
  // 写入文件
  await writeFile(fn, content, 'utf-8');
  console.log('Successfully saved:', fn);
}

async function copyFolder(src, dest) {
    try {
        // 确保目标文件夹存在
        await mkdir(dest, { recursive: true });
        
        // 读取源文件夹内容
        const entries = await readdir(src, { withFileTypes: true });
        
        // 并行处理所有条目
        const promises = entries.map(async (entry) => {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
              if (entry.name !== 'node_modules' || entry.name !== '.git'){
                // 跳过 node_modules 和 .git 文件夹
                return Promise.resolve();
              }
              // 递归复制子文件夹
              return copyFolder(srcPath, destPath);
            } else {
                // 复制文件
                return copyFile(srcPath, destPath);
            }
        });
        
        await Promise.all(promises);
        //console.log('复制完成');
    } catch (err) {
        //console.error('复制失败：', err);
        throw err;
    }
}

export { getDirectories, getGitRepositories, readFilesByType, updateFile, copyFolder };


// 使用示例
// const dirs = await getDirectories('./myFolder');
// console.log('所有文件夹:', dirs);