import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import cuid from 'cuid';
import {
    clolor_success,
    clolor_warning,
    clolor_daner,
    clolor_info,
    style_cell,
    station
} from './station_items.js'; // 注意：需要包含文件扩展名

import { fetch_all_solutions } from '../api/solution_file.js';  // 
import { read_all_blocks } from '../blocks/index.js';  // 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log('business.__dirname:', __dirname)

const root = "/home/workspace/vite4vue3/serve"

const runtimeEnv = {};

const syncDelay  = async (ms) =>{   
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const startBusiness = async (io) => {
    // 初始化运行环境
    runtimeEnv.config = JSON.parse(fs.readFileSync(join(root, "config.json")));     // 读取 config
    runtimeEnv.solutions = await fetch_all_solutions(join(root, "public", "solutions"));    // 读取所有解决方案
    runtimeEnv.blocks = await read_all_blocks(join(root, 'blocks'));    // 站点信息
    // console.log(`runtimeEnv.blocks: ${JSON.stringify(runtimeEnv.blocks)}`);

    // 给 runtimeEnv.solutions 的每个节点设置 id
    const addID = async (node) => {
        if(node.id){    return; }
        node.id = cuid();
    }
    const addIDLoopArray = (arry) => {
        for(let ele of arry){
            addID(ele);
            if (ele.hasOwnProperty('children')){
                addIDLoopArray(ele.children);
            }
        }        
    }
    addIDLoopArray(runtimeEnv.solutions);
    
    io.on("connection", (socket) => {
        console.log("<startBusiness user_connected >");

        socket.on("send-message", (data)=>{
            console.log(`on_send-message: ${data}`)
        });
        //socket.emit('@page:station.name', station.name);

        socket.on("ui.initial", (data)=>{
            console.log(`ui.initial: ${JSON.stringify(data)}`);
            socket.emit('ui.station.name', station.name);
            socket.emit('ui.station.statistict', {
                total: 1000,
                fails: 1,
                time: 123.4
            });
            socket.emit('ui.station.header', station.header);
            socket.emit('ui.station.rows', station.rows);
        });

        socket.on("allblocks", (data) => {
            console.debug(data);
            socket.emit('allblocks', station.name);
        });

        socket.on("allsolutions", async () => {
            const obj = {
                current_solution_name: runtimeEnv.config.solution_name,
                solutions: runtimeEnv.solutions,
                blocks: runtimeEnv.blocks,
            };
            //console.log('server.allsolutions', obj);
            socket.emit('allsolutions', JSON.stringify(obj));
        });


    });

    io.on("disconnection", (socket)=>{
        console.log("a user disconnected");
    });
}

const startTest  = async (io, tick, text, stlye_type) => {
    // console.debug('startTest:', tick, text, stlye_type);
    io.emit('ui.station.test.start', {});
    const rows = station.rows;
    for(const row of rows){
        updateSlotCell(row.id, 'slot1', text, stlye_type);
        await syncDelay(tick);
    }
    return 'success';
}

export {
  startBusiness,
  startTest,
}


