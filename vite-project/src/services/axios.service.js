// src/utils/request.js
import axios from "axios";
import router from "@/router";

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 可以在这里添加全局loading
    // showLoading()

    return config;
  },
  (error) => {
    // 对请求错误做些什么
    // hideLoading()
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // hideLoading()

    // 对响应数据做点什么
    const res = response.data;

    // 假设我们的API返回格式为 { code, data, message }
    if (res.code !== 200) {
      // 处理业务错误
      if (res.code === 401) {
        // 未授权，跳转到登录页
        router.push("/login");
      }

      // 显示错误消息
      useMessage().error(res.message || "Error");
      return Promise.reject(new Error(res.message || "Error"));
    }

    return res.data; // 直接返回有用的数据部分
  },
  (error) => {
    // hideLoading()

    // 对响应错误做点什么
    if (error.response) {
      switch (error.response.status) {
        case 400:
          error.message = "请求错误";
          break;
        case 401:
          error.message = "未授权，请登录";
          router.push("/login");
          break;
        case 403:
          error.message = "拒绝访问";
          break;
        case 404:
          error.message = `请求地址出错: ${error.response.config.url}`;
          break;
        case 500:
          error.message = "服务器内部错误";
          break;
        default:
          error.message = `连接错误 ${error.response.status}`;
      }
    } else if (error.request) {
      error.message = "网络连接异常，请检查网络";
    }

    useMessage().error(error.message);
    return Promise.reject(error);
  },
);

export default service;
