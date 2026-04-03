import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取 __dirname 的等价物（ES Module 中没有 __dirname）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//console.log('import.meta.env:', import.meta.env)

const read_all_blocks = async (folderPath) => {
  let blocks = [];
  
  try {
    const files = await fs.readdir(folderPath);
    const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
    
    // 并行读取所有 JSON 文件
    const readPromises = jsonFiles.map(async (file) => {
      const filePath = path.join(folderPath, file);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        blocks = blocks.concat(JSON.parse(content));
      } catch (error) {
        console.error(`Error reading file ${file}:`, error.message);
      }
    });
    
    await Promise.all(readPromises);
    return blocks;
  } catch (error) {
    console.error('Error reading directory:', error.message);
    return {};
  }
}

const read_blocks = async (folderPath, type_arry) => {
  const arry = await read_all_blocks(folderPath);
  //console.log(JSON.stringify(arry));
  let blocks = [];
  for(const block of arry){
    for(const type of type_arry){
      if(block.type === type){
        blocks.push(block);
      }
    }
    
  }
  return blocks;
}

export { 
  read_all_blocks,
  read_blocks,
};

// const obj = await read_all_blocks("./");
// console.log(JSON.stringify(obj));


// const obj = await read_blocks("./", ["place_communication_uart"]);
// console.log(JSON.stringify(obj));
