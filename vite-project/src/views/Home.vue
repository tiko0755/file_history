<template>
  <el-container class="layout-container-demo">
    <el-header style="text-align: right; font-size: 12px; height: 50px">
      <div class="toolbar">
        <el-dropdown>
          <el-icon style="margin-right: 8px; margin-top: 1px">
            <setting />
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="onClickDownload">下载</el-dropdown-item>
              <el-dropdown-item @click="onClickRun">运行</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <span>Tom</span>
      </div>
    </el-header>
    <el-main>
      <component
        :is="currentTab.component"
        :key="propsID"
        :title="currentTab.props.title"
        :tree="currentTab.props.tree"
        :important_label="important_label"
        class="tab-content"
        @update="handleUpdate"
      ></component>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
console.log('run Home.vue');

import { onMounted, ref, computed } from "vue";
import { Setting } from "@element-plus/icons-vue";
import ProjectManager from "@/components/ProjectManager.vue";
import TestPage from "@/components/TestPage.vue";
import { useSolutionStore } from "@/stores/solution.store";

const solutionStore = useSolutionStore();

// 组件配置映射
const componentsMap = {
  TestPage: {
    component: TestPage, // 使用类型断言，告诉 TypeScript 这是一个组件
    props: {
      title: "TestPage",
      tree: []
    }
  },
  ProjectManager: {
    component: ProjectManager, // 使用类型断言，告诉 TypeScript 这是一个组件
    props: {
      title: "ProjectManager",
      tree: []
    },
  }
};

// 定义所有可能的 tab 名称类型
type TabName = 'TestPage' | 'ProjectManager'
// 使用类型断言或定义 ref 的类型
const currentTabName = ref<TabName>('TestPage')
const propsID = ref(0);
const important_label = ref("");

const onClickDownload = () => {
  propsID.value++;
  console.log('onClickDownload');
  currentTabName.value = "ProjectManager";
};
const onClickRun = () => {
  propsID.value++;
  console.log('onClickRun');
  currentTabName.value = "TestPage";
};

// 计算属性返回当前组件
const currentTab = computed(() => componentsMap[currentTabName.value]);

onMounted(() => {
  console.log("Home.mounted");
});

const handleUpdate = (event: Event) => {
  // 处理组件事件
  console.log("组件更新:", event);
};

solutionStore.initializeSocketListeners();
solutionStore.downloadAllSolutions()
.then(()=>{
  componentsMap["ProjectManager"].props.tree = solutionStore.solutions;
  important_label.value = solutionStore.currentSolutionName;
  console.log(`currentSolutionName: ${solutionStore.currentSolutionName}`);
  //console.log('downloadAllSolutions.componentsMap:', componentsMap)
  //console.log('downloadAllSolutions.currentTabName:', currentTabName.value)
})

</script>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
}
.layout-container-demo .el-main {
  padding: 0;
  height: calc(100% - 50px); /* 减去 header 的高度 */
}
.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}

.tab-content {
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
