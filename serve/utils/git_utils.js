import { simpleGit } from 'simple-git';
import { readFilesByType } from './fs_utils.js'; 

// "/home/workspace/solution_manager/repo/undefined-01"
const repoTop = async (repoDir, types = [".json"]) => {
    const options = {
        baseDir: repoDir,
        binary: 'git',
        maxConcurrentProcesses: 6,
    };
    const git = simpleGit(options);

    const top = {
        baseDir: options.baseDir,
        content:[]
    };

    // 获取仓库状态
    const status = await git.status();
    // console.log(status);
    // console.log(status.isClean()); // 是否干净
    top.branch = status.current; // 当前分支
    top.isClean = await status.isClean(); // 是否干净
    top.detached = await status.detached; // 是否处于分离头状态

    // 获取提交历史
    const log = await git.log();
    // console.log(log);
    top.all = log.all; // 所有提交
    top.latest = log.latest; // 最新提交

    const typesX = types.map(type => type.startsWith('.') ? type : '.' + type);

    top.files = await readFilesByType(repoDir, typesX).catch(err => {
        console.error('读取文件失败:', err);
        return [];
    });

    return top;
}

export { repoTop };
