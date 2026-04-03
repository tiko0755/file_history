<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">系统登录</h2>
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleLogin"
            :loading="loading"
            style="width: 70%"
          >
            登录
          </el-button>
          <el-link type="info">访客旁观</el-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { session } from "@/utils/sessionStorage";

import { useSocketStore } from "@/stores/socket.store";
import { useUIStore } from "@/stores/ui.store";

const socketStore = useSocketStore();
const uiStore = useUIStore();
const { initializeSocketListeners, sendMessage, downloadAllSolutions } = socketStore;

const router = useRouter();
const route = useRoute();
// 读取 redirect 参数
const redirect = route.query.redirect || "/";

const loginForm = ref({
  username: "",
  password: "",
});

const loginRules = ref({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" },
  ],
});

const loading = ref(false);
const loginFormRef = ref(null);

const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      const postData = {
        username: loginForm.value.username,
        password: loginForm.value.password,
      };
      const response = await axios.post(
        import.meta.env.VITE_API_BASE_URL + "/login",
        postData,
      );
      if (response.data.success) {
        console.log("登录成功:", response.data);
        ElMessage.success("登录成功");

        initializeSocketListeners();
        uiStore.initializeListeners();

        const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "token";
        session.set(TOKEN_KEY, response.data);
        console.log(`will redirect to ${redirect}`);
        router.push({
          path: redirect,
          query: {
            username: response.data.username,
            role: response.data.role,
          },
        });

      } else {
        ElMessage.error(response.data.message);
      }
    } catch (error) {
      ElMessage.error("登录失败，请检查网络或联系管理员");
      console.error("登录错误:", error);
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  width: 400px;
  padding: 20px;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.el-link {
  margin-left: 20px;
  margin-right: 8px;
}
</style>
