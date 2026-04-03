<script setup lang="ts">
import {
  ElementPlus,
  Iphone,
  Flag,
  Location,
  OfficeBuilding,
  Tickets,
  User,
  Menu,
  Document,
  Menu as IconMenu,
  Setting,
  Expand,
  Fold,
  Sunny,
  Moon,
  Edit,
  Top,
  Bottom,
} from "@element-plus/icons-vue";
import { ElConfigProvider, version as epVersion } from "element-plus";
import {
  ref,
  reactive,
  defineComponent,
  h,
  computed,
  onMounted,
  version as vueVersion,
} from "vue";
import type { ComponentSize } from "element-plus";
import { storeToRefs } from "pinia";
import { useSocketStore } from "@/stores/socket.store";
import { useUIStore } from "@/stores/ui.store";
import { session } from "@/utils/sessionStorage";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import en from "element-plus/dist/locale/en.mjs";
import socketService from "@/services/socket.service";
import { ElMessageBox } from "element-plus";
import type { DrawerProps } from "element-plus";

interface Product {
  id: string;
  name: string;
  amount1: string;
  amount2: string;
  amount3: number;
}

interface SummaryMethodProps<T = Product> {
  columns: TableColumnCtx<T>[];
  data: T[];
}

const clolor_success = "#67C23A";
const clolor_warning = "#E6A23C";
const clolor_daner = "#F56C6C";
const clolor_info = "#909399";

// username和role从cookies获取
// 1. 获取token（假设session是之前封装的工具）
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "token";
const token = session.get(TOKEN_KEY);
console.debug("TestPage.token:", token);
const username = ref(token.username);
const role = ref(token.role);

const socketStore = useSocketStore();
const { isConnected, messages, connectionError } = storeToRefs(socketStore);
const { initializeSocketListeners, sendMessage } = socketStore;

const uiStore = useUIStore();

const language = ref("zh-cn");
const locale = computed(() => (language.value === "zh-cn" ? zhCn : en));

const drawer = ref(false);
const drawer2 = ref(false);
const direction = ref<DrawerProps["direction"]>("rtl");
const radio1 = ref("Option 1");
const drawerhandleClose = (done: () => void) => {
  ElMessageBox.confirm("Are you sure you want to close this?")
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};
function cancelClick() {
  drawer2.value = false;
}
function confirmClick() {
  ElMessageBox.confirm(`Are you confirm to chose ${radio1.value} ?`)
    .then(() => {
      drawer2.value = false;
    })
    .catch(() => {
      // catch error
    });
}

const newMessage = ref("hello, it is client");
const degbugReceive = ref(
  "hello, this section shows debug messages from backend.",
);

const form = reactive({
  name: "",
  region: "",
  date1: "",
  date2: "",
  delivery: false,
  type: [],
  resource: "",
  desc: "",
  command: "default",
  gender: "male",
});

// 保存修改
const saveRow = (row) => {
  console.log("保存数据:", row);
  // 这里可以调用API保存数据
  // expandedRow.value = null
};

// 取消编辑
const cancelEdit = (row) => {
  // 如果需要恢复原始数据，可以在这里实现
  // expandedRow.value = null
};

const isCollapse = ref(true);
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};

onMounted(() => {
  console.log("Testpage.mounted");
  // initializeSocketListeners();
  // uiStore.initializeListeners();
});

const handleSendMessage = () => {
  if (newMessage.value.trim()) {
    console.debug(newMessage.value);
    sendMessage(newMessage.value);
    newMessage.value = "";
  }
};

const size = ref<ComponentSize>("default");
const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  console.log("theme:", isDark.value);
  if (isDark.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const debugSend = () => {
  const message = {
    name: "zhangsan",
    password: "<PASSWORD>",
    msg: form.command,
  };
  sendMessage(JSON.stringify(message));
};

const iconStyle = computed(() => {
  const marginMap = {
    large: "8px",
    default: "6px",
    small: "4px",
  };
  return {
    marginRight: marginMap[size.value] || marginMap.default,
  };
});
const blockMargin = computed(() => {
  const marginMap = {
    large: "32px",
    default: "28px",
    small: "24px",
  };
  return {
    marginTop: marginMap[size.value] || marginMap.default,
  };
});

const getSummaries = (param: SummaryMethodProps) => {
  const { columns, data } = param;
  const sums: (string | VNode)[] = [];
  columns.forEach((column, index) => {
    if (column.property === "description") {
      sums[index] = h("div", { style: { textDecoration: "underline" } }, [
        "Total Time(S)",
      ]);
    } else if (column.property === "slot1") {
      sums[index] = h("div", { style: { textDecoration: "underline" } }, [
        "1.23",
      ]);
    } else if (column.property === "slot2") {
      sums[index] = h("div", { style: { textDecoration: "underline" } }, [
        "2.23",
      ]);
    } else if (column.property === "slot3") {
      sums[index] = h("div", { style: { textDecoration: "underline" } }, [
        "3.23",
      ]);
    } else if (column.property === "slot4") {
      sums[index] = h("div", { style: { textDecoration: "underline" } }, [
        "4.23",
      ]);
    } else if (column.property === "slot5") {
      sums[index] = "5.12";
    } else if (column.property === "slot6") {
      sums[index] = "6.12";
    } else if (column.property === "slot7") {
      sums[index] = "7.12";
    } else if (column.property === "slot8") {
      sums[index] = "8.12";
    } else {
      sums[index] = "";
    }
  });

  return sums;
};

const cellStyle = ({ column, rowIndex, columnIndex }) => {
  // console.debug(`column.property:${column.property} rowIndex:${rowIndex} columnIndex:${columnIndex}`);
  // console.debug(`uiStore.rows[${rowIndex}].style.slot1:`, uiStore.rows[rowIndex].style['slot1']);
  // the Index col
  if (columnIndex < 2) {
    return {
      color: "#1D1E1F",
      fontWeight: "normal",
      backgroundColor: clolor_info,
    };
  }
  return uiStore.rows[rowIndex].style[column.property] || {};
};

const headerCellStyle = ({ row, column, rowIndex, columnIndex }) => {
  // 默认样式
  const defaultStyle = {
    color: "#1D1E1F",
    fontWeight: "normal",
    backgroundColor: clolor_info,
  };
  // 从store获取样式，合并时优先使用store中的值
  const storeStyle = uiStore.header[column.property] || {};
  return {
    ...defaultStyle,
    ...storeStyle, // 覆盖默认值
  };
};
</script>

<template>
  <el-config-provider :locale="locale">
    <el-container class="app-container">
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <el-menu
          default-active="2"
          class="el-menu-vertical-demo"
          :collapse="isCollapse"
          @open="handleOpen"
          @close="handleClose"
        >
          <el-sub-menu index="1">
            <template #title>
              <el-icon><location /></el-icon>
              <span>Navigator One</span>
            </template>
            <el-menu-item-group>
              <template #title><span>Group One</span></template>
              <el-menu-item index="1-1">item one</el-menu-item>
              <el-menu-item index="1-2">item two</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="Group Two">
              <el-menu-item index="1-3">item three</el-menu-item>
            </el-menu-item-group>
            <el-sub-menu index="1-4">
              <template #title><span>item four</span></template>
              <el-menu-item index="1-4-1">item one</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
          <el-menu-item index="2">
            <el-icon><icon-menu /></el-icon>
            <template #title>Navigator Two</template>
          </el-menu-item>
          <el-menu-item index="3" disabled>
            <el-icon><document /></el-icon>
            <template #title>Navigator Three</template>
          </el-menu-item>
          <el-menu-item index="4">
            <el-icon><setting /></el-icon>
            <template #title>Navigator Four</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header height="40px">
          <el-descriptions class="margin-top" :column="6" :size="size" border>
            <el-descriptions-item label-width="80">
              <template #label>
                <div class="cell-item">
                  {{ role }}
                </div>
              </template>
              {{ username }}
            </el-descriptions-item>
            <el-descriptions-item label-width="110">
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <Flag />
                  </el-icon>
                  工站名称
                </div>
              </template>
              {{ uiStore.station }}
            </el-descriptions-item>
            <el-descriptions-item label-width="110">
              <template #label>
                <div class="cell-item">总数量(PCS)</div>
              </template>
              {{ uiStore.total }}
            </el-descriptions-item>
            <el-descriptions-item label-width="110">
              <template #label>
                <div class="cell-item">不良数(PCS)</div>
              </template>
              {{ uiStore.fails }}
            </el-descriptions-item>
            <el-descriptions-item label-width="80">
              <template #label>
                <div class="cell-item">良率(%)</div>
              </template>
              {{ uiStore.pass_rate }}
            </el-descriptions-item>
            <el-descriptions-item label-width="110">
              <template #label>
                <div class="cell-item">测试时间(S)</div>
              </template>
              {{ uiStore.time }}
            </el-descriptions-item>
          </el-descriptions>
        </el-header>

        <el-main>
          <el-drawer v-model="drawer2" direction="rtl">
            <template #header>
              <h4>set title by slot</h4>
            </template>
            <template #default>
              <div>
                <el-radio v-model="radio1" value="Option 1" size="large">
                  Option 1
                </el-radio>
                <el-radio v-model="radio1" value="Option 2" size="large">
                  Option 2
                </el-radio>
              </div>
            </template>
            <template #footer>
              <div style="flex: auto">
                <el-button @click="cancelClick">cancel</el-button>
                <el-button type="primary" @click="confirmClick"
                  >confirm</el-button
                >
              </div>
            </template>
          </el-drawer>

          <el-table
            :data="uiStore.tableData"
            size="small"
            style="width: 100%"
            :summary-method="getSummaries"
            show-summary
            :cell-style="cellStyle"
            :header-cell-style="headerCellStyle"
          >
            <el-table-column fixed type="index" width="30" />
            <el-table-column fixed type="expand" v-if="role !== 'Developer'">
              <template #default="{ row }">
                <el-form
                  :model="row"
                  size="small"
                  label-width="100px"
                  @submit.prevent="saveRow(row)"
                >
                  <el-form-item label="Description">
                    <el-input v-model="row.description"></el-input>
                  </el-form-item>
                  <el-form-item label="Lower">
                    <el-input v-model="row.lower"></el-input>
                  </el-form-item>
                  <el-form-item label="Upper">
                    <el-input v-model="row.upper"></el-input>
                  </el-form-item>
                  <el-form-item label="Unit">
                    <el-input v-model="row.unit"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" native-type="submit"
                      >保存</el-button
                    >
                    <el-button @click="cancelEdit(row)">取消</el-button>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column
              fixed
              label=""
              min-width="30px"
              v-if="role === 'Developer'"
            >
              <template #default>
                <el-button
                  link
                  :icon="Edit"
                  size="small"
                  @click="drawer2 = true"
                />
              </template>
            </el-table-column>
            <el-table-column
              fixed
              prop="description"
              :label="uiStore.header.description.label"
              :width="uiStore.header.description.width"
            />
            <el-table-column
              fixed
              prop="lower"
              :label="uiStore.header.lower.label"
              :width="uiStore.header.lower.width"
              align="center"
            />
            <el-table-column
              fixed
              prop="upper"
              :label="uiStore.header.upper.label"
              :width="uiStore.header.upper.width"
              align="center"
            />
            <el-table-column
              fixed
              prop="unit"
              :label="uiStore.header.unit.label"
              :width="uiStore.header.unit.width"
              align="center"
            />
            <el-table-column
              v-if="uiStore.header.slot1.enable"
              prop="slot1"
              :label="uiStore.header.slot1.label"
              :width="uiStore.header.slot1.col_width"
              align="center"
            />
            <el-table-column
              v-if="uiStore.header.slot2.enable"
              prop="slot2"
              :label="uiStore.header.slot2.label"
              :width="uiStore.header.slot2.col_width"
              align="center"
            />
            <el-table-column
              v-if="uiStore.header.slot3.enable"
              prop="slot3"
              :label="uiStore.header.slot3.label"
              :width="uiStore.header.slot3.col_width"
              align="center"
            />
            <el-table-column
              v-if="uiStore.header.slot4.enable"
              prop="slot4"
              :label="uiStore.header.slot4.label"
              :width="uiStore.header.slot4.col_width"
              align="center"
            />
            <el-table-column
              v-if="uiStore.header.slot5.enable"
              prop="slot5"
              :label="uiStore.header.slot5.label"
              :width="uiStore.header.slot5.col_width"
              align="center"
            />
            <el-table-column
              v-if="uiStore.header.slot6.enable"
              prop="slot6"
              :label="uiStore.header.slot6.label"
              :width="uiStore.header.slot6.col_width"
              align="center"
            />
            <el-table-column
              v-if="uiStore.header.slot7.enable"
              prop="slot7"
              :label="uiStore.header.slot7.label"
              :width="uiStore.header.slot7.col_width"
              align="center"
            />
            <el-table-column
              v-if="uiStore.header.slot8.enable"
              prop="slot8"
              :label="uiStore.header.slot8.label"
              :width="uiStore.header.slot8.col_width"
              align="center"
            />
          </el-table>
        </el-main>
        <el-footer>
          <el-text class="mx-1" size="small">{{ degbugReceive }}</el-text>
        </el-footer>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<style scoped>
.app-container {
  height: 100vh;
}
.el-aside {
  transition: width 0.9s;
  overflow: hidden;
}

.el-header {
  padding: 2px !important; /* 调整为需要的值 */
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.el-main {
  padding: 2px !important; /* 调整为需要的值 */
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.el-descriptions {
  margin-top: 4px;
}
.cell-item {
  display: flex;
  align-items: center;
}
.margin-top {
  margin-top: 1px;
}
</style>
