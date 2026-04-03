import path from 'path';
import { readdir, readFile, writeFile } from 'fs/promises';

const make_solution = async (fName) => {
    try {
        fName = fName.endsWith(".json") ? fName : `${fName}.json`;
        //console.log(`<make_solution fName:${fName} >`);
        const data = await readFile(fName, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`读取或解析 ${name}.json 失败:`, error.message);
        throw error; // 或返回 null/默认值
    }
}

const fetch_all_solutions = async (dirPath) => {
    try {
        //console.log('do fetch_all_solutions:', dirPath);
        const files = await readdir(dirPath);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        const solutions = [];
        for (const file of jsonFiles) {
            const name = path.basename(file, '.json'); // 去掉 .json 后缀
            const data = await make_solution(path.join(dirPath, name));
            data.label = name;
            solutions.push(data);
        }
        return solutions;
    } catch (error) {
        console.error('加载所有解决方案失败:', error.message);
        throw error;
    }
}

// (async () => {
//     const solutions = await fetch_all_solutions("../public/solutions");
//     console.dir(solutions);
// })();

export {    
  fetch_all_solutions,    // read all the solutions
}
