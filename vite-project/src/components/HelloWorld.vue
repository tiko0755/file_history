<script setup>
import { ref } from "vue";

defineProps({
  msg: String,
});

const count = ref(0);

const tableData = [
  {
    date: "2016-05-03",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
    status: "危险",
  },
  {
    date: "2016-05-02",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
    status: "危险",
  },
  {
    date: "2016-05-04",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
    status: "危险",
  },
  {
    date: "2016-05-01",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
    status: "危险",
  },
  {
    date: "2016-05-08",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
    status: "警告",
  },
  {
    date: "2016-05-06",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
    status: "正常",
  },
];

const cellStyle = ({ row, column }) => {
  if (column.property === "status") {
    switch (row.status) {
      case "危险":
        return { background: "#ffdddd", color: "#ff0000" };
      case "警告":
        return { background: "#fff3e0", color: "#ff9900" };
      default:
        return { background: "#e8f5e9", color: "#009688" };
    }
  }
  return {};
};

const handleCellClick = (row, column) => {
  if (column.property === "status") {
    row.status = "正常";
  }
};
</script>

<template>
  <el-table
    :data="tableData"
    :cell-style="cellStyle"
    style="width: 100%"
    @cell-click="handleCellClick"
  >
    <el-table-column prop="date" label="Date" width="180" />
    <el-table-column prop="name" label="Name" width="180" />
    <el-table-column prop="name" label="Slot1" width="180" />
    <el-table-column prop="name" label="Slot2" width="180" />
    <el-table-column prop="name" label="Slot3" width="180" />
    <el-table-column prop="status" label="状态" width="180" />
    <el-table-column prop="address" label="Address" />
  </el-table>

  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
