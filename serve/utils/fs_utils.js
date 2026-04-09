// getDirectories.js
import { readdir, readFile, access } from 'node:fs/promises';
import { join, extname } from 'node:path';

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

/**
 * 读取指定文件夹下特定文件类型的所有文件内容
 * @param {string} folderPath - 文件夹路径
 * @param {string|string[]} extensions - 文件扩展名（如 '.txt' 或 ['.js', '.json']）
 * @returns {Promise<Array<{filePath: string, content: string}>>}
 */
async function readFilesByType(folderPath, extensions) {
    // 统一转为数组处理
    const extList = Array.isArray(extensions) ? extensions : [extensions];
    
    // 确保扩展名以点开头
    const normalizedExts = extList.map(ext => ext.startsWith('.') ? ext : `.${ext}`);
    
    try {
        // 读取文件夹内容
        const files = await readdir(folderPath);
        
        // 过滤出指定类型的文件
        const targetFiles = files.filter(file => {
            const ext = extname(file);
            return normalizedExts.includes(ext);
        });
        
        // 并行读取所有文件内容
        const results = await Promise.all(
            targetFiles.map(async (file) => {
                const filePath = join(folderPath, file);
                const content = await readFile(filePath, 'utf-8');
                return { filePath, content };
            })
        );
        
        return results;
    } catch (error) {
        console.error('读取文件失败:', error);
        throw error;
    }
}


export { getDirectories, getGitRepositories, readFilesByType };


// 使用示例
// const dirs = await getDirectories('./myFolder');
// console.log('所有文件夹:', dirs);