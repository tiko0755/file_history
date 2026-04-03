import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/Login.vue";
import HomeView from "@/views/Home.vue";
//import BlocklyEditor from "@/views/BlocklyEditor.vue";
import { session } from "@/utils/sessionStorage";

const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  console.log("to:", to);
  // 1. 获取token（假设session是之前封装的工具）
  // 定义 token 的存储 key
  const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "token";
  // 获取 token
  const token = session.get(TOKEN_KEY);
  // 调试用，生产环境应移除
  if (process.env.NODE_ENV !== "production") {
    console.debug("[路由守卫] token状态:", token);
  }

  // 2. 检查是否需要认证
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // 3. 验证token是否存在且有效
    if (!token || !token.success) {
      // 4. 重定向到登录页，携带原路径以便登录后跳转
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
      return;
    }
  }

  // 5. 放行路由
  next();
});

export default router;
