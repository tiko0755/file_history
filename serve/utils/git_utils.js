import { simpleGit } from 'simple-git';
import { readFilesByType } from './fs_utils.js'; 
import path from 'node:path';

const createGit = (root, repo) => {
    const repoDir = path.join(root, repo)
    const options = {
        baseDir: repoDir,
        binary: 'git',
        maxConcurrentProcesses: 6,
    };
    return simpleGit(options);
}

const init = async (root, repo) => {
    const git = createGit(root, repo);
    await git.init();
    await git.add('./*');
    await git.commit('Initial commit');
    // 获取仓库状态
    const status = await git.status();
    return status;
}

// "/home/workspace/solution_manager/repo/undefined-01"
// 获取 repo/目录下所有仓库的数据
const repoTop = async (root, repo, types = [".json"]) => {
    const git = createGit(root, repo);
    const top = {
        baseDir: repo,
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
    // 提取所有文件列表的概要信息
    top.files = await readFilesByType(root, repo, typesX).catch(err => {
        console.error('读取文件失败:', err);
        return [];
    });
    
    return top;
}

const commit = async (root, repo, files = ['.'], commitMsg = ["这个家伙很懒,什么也没有留下."]) => {
    const git = createGit(root, repo);

    await git.add(files);
    await git.commit(commitMsg);
    console.log(`#post.commit ✅ 提交成功: ${commitMsg}`);
    // 获取仓库状态
    const status = await git.status();
    console.log('#post.commit status:', status)
    return status;
}

const status = async (root, repo) => {
    const git = createGit(root, repo);
    // 获取仓库状态
    const status = await git.status();
    return status;
}

async function switchToExistingBranch(root, repo, branch) {
  const git = createGit(root, repo);
  // 切换到 develop 分支
  await git.checkout(branch);
  console.log(`✅ 已切换到 ${branch} 分支`);
  // 获取当前分支信息
  const status = await git.status();
  console.log('当前分支:', status.current);
  return status;
}

async function createAndSwitchBranch(root, repo, branch) {
  const git = createGit(root, repo);
  // 创建新分支并切换过去（相当于 git checkout -b new-feature）
  await git.checkoutLocalBranch(branch);
  console.log(`✅ 已创建并切换到 ${branch} 分支`);
  const status = await git.status();
  console.log('当前分支:', status.current);
  return status;
}

// 检查分支是否存在
async function branch(root, repo) {
  const git = createGit(root, repo);
  // 创建新分支并切换过去（相当于 git checkout -b new-feature）
  return await git.branch();
}

async function mergeBranches(root, repo, from, to) {
  const git = createGit(root, repo);
  // 切换到目标分支（例如 main）
  await git.checkout(to);
  // 将 feature/login 分支合并进来
  const result = await git.mergeFromTo(from, to);
  console.log('合并结果:', result);
  return result;
}

async function currentBranch(root, repo) {
  const git = createGit(root, repo);
  // 获取当前分支名以便之后切换回去
  return currentBranch = (await git.branchLocal()).current;
}

export { 
  init,
  repoTop, 
  commit, 
  status, 
  switchToExistingBranch, 
  createAndSwitchBranch, 
  branch, 
  mergeBranches,
  currentBranch
};
