<script setup>
//import HelloWorld from './components/HelloWorld.vue'
//import TestPage from './components/TestPage.vue'
</script>

<template>
  <!-- <TestPage msg="Vite + Vue" /> -->
  <div id="app">
    <router-view />
  </div>
</template>

<style scoped>
html,
body {
  height: 100%;
  margin: 0; /* 移除默认边距，避免滚动条引起的计算误差 */
}
</style>
