<template>
  <div ref="blocklyDiv" class="blockly-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from "vue";

import * as Blockly from "blockly"; // 正确的方式
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly';

import { AnyColumn } from "element-plus/es/components/table-v2/src/common.mjs";
import { AnyColumns } from "element-plus/es/components/table-v2/src/types.mjs";

import { useSolutionStore } from "@/stores/solution.store";

interface Props {
  title: string;
  toolbox: any;
  workspace: string;
  blocks: Array<string>;
  callbackkey?: Array<string>;
  id?: string;
}

const props = defineProps<Props>();
//console.log(`props.callbackkey: ${props.callbackkey}`)
console.log(`props.id: ${props.id}`)

const blocklyToolbox = ref({
  kind: "flyoutToolbox",
  contents: [
    {
      kind: "label",
      text: "未识别的toolbox",
    }
  ],
});

const solutionStore = useSolutionStore();

console.log("BlocklyEditor solutionStore.blocks:", solutionStore.blocks);
// Explicitly type the elements of solutionStore.blocks to avoid implicit 'any'
const blocksDef = solutionStore.blocks.map((item: { block: any }) => item.block);
const myBlockDefinitions = Blockly.common.createBlockDefinitionsFromJsonArray(blocksDef);
Blockly.common.defineBlocks(myBlockDefinitions);

javascriptGenerator.addReservedWords('code');   // 'code'作为保留字
for(const ele of solutionStore.blocks){
  const codeStr = ele.generator.join("");
  //console.log(`BlocklyEditor codeStr for block type ${ele.block.type}:`, codeStr);
  // 创建包装函数
  const wrappedCode = `
      const Order = generator.Order;
      ${codeStr}
  `;
  // 创建函数，注入 generator 和 Order
  const generatorFn = new Function('block', 'generator', wrappedCode);
  // 注册
  (javascriptGenerator.forBlock as any)[ele.block.type] = generatorFn;
}

// 使用 defineEmits 定义事件
const emit = defineEmits(['mounted', 'unmounted', 'block-button-click']);

const blocklyDiv = ref<any>(null);
const workspace = ref<any>(null);

onMounted(() => {
  emit("mounted", "componentName");

  const injectOption = {
    toolbox: blocklyToolbox.value,
    media: "/media/", // 指向打包后的 media 目录
    // 其他配置选项
    trashcan: true,
    grid: {
      spacing: 20,
      length: 3,
      colour: "#ccc",
      snap: true,
    },
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2,
    },
  };

  // add gap
  const gap = {"kind": "sep", "gap": 5}
  if(props?.toolbox?.contents){
    const { contents, ...rest } = props.toolbox;
    console.log(rest);
    const contentsX = [];
    for(let i=0; i<contents.length; i++){
      contentsX.push(contents[i]);
      contentsX.push(gap);
    }
    blocklyToolbox.value = {...rest};
    blocklyToolbox.value.contents = contentsX;
    //console.log("BlocklyEditor.onMounted blocklyToolbox.value:", blocklyToolbox.value);  
    injectOption.toolbox = blocklyToolbox.value;
  }
  else{
    delete (injectOption as any).toolbox;
  }

  workspace.value = Blockly.inject(blocklyDiv.value, injectOption);

  for(const key of props.callbackkey || []){
    workspace.value.registerButtonCallback(
      key,
      () => {
        if(key === "onClickSaveSolution"){
          const workspace = Blockly.getMainWorkspace();
          const state = Blockly.serialization.workspaces.save(workspace);
          const jsonText = JSON.stringify(state);
          const code = javascriptGenerator.workspaceToCode(workspace);
          //console.log("保存方案, workspaceState:", jsonText);
          //console.log("保存方案, code:", code);
          emit("block-button-click", key, { 
            id: props.id,
            workspaceState: jsonText,
            code: code
          });
        }
        else{
          emit("block-button-click", key, { id: props.id }, "hello");
        }
        
      },
    );
  }
  // workspace.value.updateToolbox(toolboxConfigExported);
  console.log("工具箱初始化完成");
});

// 清理
onUnmounted(() => {
  // if (workspace) {
  //   workspace.dispose();
  // }
  emit("unmounted", "data-changed.....");
});
</script>

<style>
.blockly-container {
  height: 100vh;
  width: 100%;
  min-width: 800px;
}
</style>
