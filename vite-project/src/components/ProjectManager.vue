<template>
  <el-container class="layout-container-demo">
    <el-aside width="200px">
      <el-tree
        style="max-width: 200px"
        :data="prjTree"
        node-key="id"
        accordion
        @node-click="onTreeNodeClick"
        :default-expanded-keys="expandedKeys"
      >
        <template #default="{ node, data }">
        <!-- 为节点容器动态绑定一个类 -->
        <div :class="getNodeClass(data)" class="custom-tree-node">
          {{ node.label }}
        </div>
        </template>
      </el-tree>
    </el-aside>
    <el-main class="main-content">
      <BlocklyEditor
        :key="tabProps.id"
        :id="tabProps.id"
        :title="tabProps.title"
        :toolbox="tabProps.toolbox"
        :workspace="tabProps.workspace"
        :blocks="tabProps.blocks"
        :callbackkey="tabProps.callbackkey"
        @data-changed="handleDataChanged"
        @mounted="handleChildMounted"
        @block-button-click="handleButtonClick"
      />
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch, nextTick, computed, callWithAsyncErrorHandling } from "vue";

import type {
  FilterNodeMethodFunction,
  RenderContentContext,
  RenderContentFunction,
  TreeInstance,
} from "element-plus";

interface Props {
  title: string;
  important_label: string;
  tree: Tree[];
}

interface Tree {
  id: string;
  label: string;
  children?: Tree[];
  content?: any;
  class?: string;
  important?: boolean;
}

interface TabProps {
  toolbox: any;
  workspace: string;
  blocks: any[];
  id: string;
  title: string;
  callbackkey: string[]; 
}

type Node = RenderContentContext["node"]; // 节点对象类型
type Data = RenderContentContext["data"]; // 节点数据类型
type NodeClickHandler = (data: Tree, node: Node, component: any) => void; // 定义 node-click 事件的完整参数类型
// 定义所有可能的 tab 名称类型
type TreeKey = 'label' | 'content' | 'class' | 'important' | 'id' // 定义树节点数据中可能的键名类型

const props = defineProps<Props>();

const currentNodeKey = ref("0");  // 初始选择的节点
const expandedKeys = ref<string[]>([]);

const prjTree = ref<Tree[]>([]);
prjTree.value = props.tree;

// 将所有后代节点的指定键设置为特定值的递归函数
const loopChildren_set = (children: Tree[], key: TreeKey, val: any) => {
    for(let _child of children){
      _child[key] = val;
      if(_child.children){
        loopChildren_set(_child.children, key, val);
      }
    }
}

const loopChildren_get = (children: Tree[], key: TreeKey, val: string[]) => {
    for(let _child of children){
      val.push(_child[key] as string);
      if(_child.children){
        loopChildren_get(_child.children, key, val);
      }
    }
}

for(let _node of prjTree.value){
  if(_node.label === props.important_label){
    currentNodeKey.value = _node.id;
    _node.important = true;
    expandedKeys.value.push(_node.id);
    loopChildren_set(_node.children || [], "important", true);
    loopChildren_get(_node.children || [], "id", expandedKeys.value);
  }
}

console.log('prjTree:', prjTree.value);

//console.log('Project.props', props);

const tabProps = ref<TabProps>({
  toolbox: props.tree[0]?.content?.toolbox || {},
  workspace: "",
  blocks: [],
  id: "1",
  title: props.tree[0]?.label || "",
  callbackkey: [],
});

const handleButtonClick = (event:string, param2: any, param3: any) => {
  console.log(event, param2, param3)
}

const handleDataChanged = (msg: string): void => {
  console.log("onhandleDataChanged, ", msg);
};

const handleChildMounted = (childName: string): void => {
  console.log(`child ${childName} onMounted`);
};

const onTreeNodeClick: NodeClickHandler = (data: Tree, node, component) => {
  //console.log("onTreeNodeClick.node:", node);
  //console.log("onTreeNodeClick.data:", JSON.stringify(data));

  const keyArry = [];
  keyArry.push("onClickSaveSolution");
  keyArry.push("onClickSaveAsSolution");
  keyArry.push("onClickDeleteSolution");
  keyArry.push("onClickApplySolution");

  tabProps.value.id = data.id;
  tabProps.value.toolbox = data.content?.toolbox || {};
  tabProps.value.workspace = data.content?.workspace || "";
  tabProps.value.title = data.label || "";
  tabProps.value.callbackkey = keyArry;

  currentNodeKey.value = data.id;
  console.log("onTreeNodeClick currentNodeKey:", currentNodeKey.value);

  //console.log(`keyArry: ${keyArry}`);
  //console.log(`tabProps.value: ${JSON.stringify(tabProps.value)}`);
};

// watch(treeRef, (val) => {
//   //console.log("treeRef:", treeRef);
// });

onMounted(() => {
  console.log("ProjectManager.mounted");
  
  //console.log(`prjTree: ${JSON.stringify(prjTree?.value)}`);
});

onUnmounted(() => {});

// 根据节点的 data 返回对应的类名
const getNodeClass = (data:Tree) => {
  if (data.important) {
    if(currentNodeKey.value === data.id){
      return 'level-1-bg-bold-text';
    }
    else{
      return 'bold-text';
    }
  }
  else if(currentNodeKey.value === data.id){
    return 'level-1-bg';
  }
  return '';
};

</script>

<style scoped>
.layout-container-demo {
  height: calc(100vh - 70px); /* 设置容器高度为视口高度减去 header 高度 */
  width: 100%; /* 设置容器宽度为100%减去左右边距 */
}

.main-content {
  height: 100%; /* 确保el-main占满剩余高度 */
  padding: 0; /* 移除内边距，让Blockly完全填满 */
  position: relative; /* 为子元素的绝对定位提供参考 */
  width: 100%;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  padding-right: 6px;
  line-height: 32px;
}

/* 自定义高亮样式，确保一直显示 */
.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
  background-color: #dadadb !important;
  color: #fff !important;
}

.el-tree--highlight-current
  .el-tree-node.is-current
  > .el-tree-node__content
  .el-tree-node__label {
  color: #e21313 !important;
}

/* 可选：添加 hover 效果 */
.el-tree-node__content:hover {
  background-color: #ecf5ff !important;
}

.level-1-bg {
  background-color: #dadadb;
}

.level-1-bg-bold-text {
  background-color: #dadadb;
  font-weight: bold;
}

.bold-text {
  font-weight: bold;
}


</style>
