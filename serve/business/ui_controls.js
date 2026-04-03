import {
    style_cell,
    station,
} from './station_items.js';

const syncDelay  = async (ms) => {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

const row_updateHeader_text = async (id, text) => {
    console.debug('row_updateHeader_text', id, text);
    return new Promise((resolve, reject) => {
        for(const row of station.rows){
            if(row.id !== id) continue;
            console.log('updateRowHeader_textzz', id, text)
            row.text.description = text.description;
            row.text.lower = text.lower;
            row.text.upper = text.upper;
            row.text.unit = text.unit;
            websocketIO.emit('ui.station.row.header.text', id, text, (res) => {
                resolve(res);
            });
            return;
        }
        reject('error! cannot find the row with id: ' + id)
    })
}
const row_updateHeader_style = async (id, style) => {
    return new Promise((resolve, reject) => {
        for(const row of station.rows){
            if(row.id !== id) continue;
            row.style.description = style.description;
            row.style.lower = style.lower;
            row.style.upper = style.upper;
            row.style.unit = style.unit;
            websocketIO.emit('ui.station.row.header.style', id, style, (res)=>{
                resolve(res);
            });
            return;
        }
        reject('error! cannot find the row with id: ' + id);
    })
}

const row_updateSlotCell = async (row_id, slot, text, style) => {
    return new Promise((resolve, reject) => {
        for(const row of station.rows){
            if(row.id !== row_id) continue;
            row.text[slot] = text;
            row.style[slot] = style_cell[style];
            websocketIO.emit('ui.station.row.slotcell', row_id, slot, text, style_cell[style], (res) => {
                resolve(res);
            });
            return;
        }
        reject('error! cannot find the row with id: ' + row_id);
        console.log('error! cannot find the row with id: ' + row_id);
    });
}

const row_defaultSlot = async (slot) => {
    const tasks = [];
    return new Promise((resolve, reject) => {
        for(const row of station.rows){
            if(!row) continue;
            tasks.push((prev) => row_updateSlotCell(row.id, slot, "", "info"));
        }

        if(tasks.length === 0){
            reject('error');
        }

        tasks.reduce(async (previousPromise, currentTask) => {
            const previousResult = await previousPromise;
            return currentTask(previousResult);
        }, Promise.resolve())
        .then(() => {
            resolve("success");
        });
    })
}

const row_defaultAllSlot = async () => {
    return new Promise((resolve, reject) => {
        // 并行执行（快）: 同时发起所有请求
        Promise.all([
            row_defaultSlot("slot1"),
            row_defaultSlot("slot2"),
            row_defaultSlot("slot3"),
            row_defaultSlot("slot4"),
            row_defaultSlot("slot5"),
            row_defaultSlot("slot6"),
            row_defaultSlot("slot7"),
            row_defaultSlot("slot8"),
        ])
        .then(() => {
            resolve("success");
        })
        .catch(error => {
            console.error('获取数据失败:', error);
        });
    })
}

export {    
  row_updateHeader_text,     // 设置测试行的标题的内容, Description, Lower, Upper, Unit
  row_updateHeader_style,    // 设置测试行的标题的样式, Description, Lower, Upper, Unit
  row_updateSlotCell,        // 设置测试行的某个槽位的内容和样式
  row_defaultSlot,          // 以默认的方式，依次更新指定slot的内容和样式为初始状态
  row_defaultAllSlot,          // 以默认的方式，依次更新指定slot的内容和样式为初始状态
}
