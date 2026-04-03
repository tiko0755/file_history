import { defineStore } from "pinia";
import socketService from "../services/socket.service";

const urlObj = new URL(import.meta.url)
const fileName = urlObj.pathname.split('/').pop()

export const useSolutionStore = defineStore("solution", {
  state: () => ({
    isConnected: false,
    messages: [],
    notifications: [],
    connectionError: null,
    solutions: [],
    blocks: [],
    currentSolutionName: null,
  }),
  getters: {
    // solutions: (state) => state.solutions,
    // currentSolutionName: (state) => state.currentSolutionName,
  },

  actions: {
    setConnected(status) {
      this.isConnected = status;
    },

    addMessage(message) {
      this.messages.push(message);
    },

    addNotification(notification) {
      this.notifications.push(notification);
    },

    setError(error) {
      this.connectionError = error;
    },

    // 初始化 socket 监听
    initializeSocketListeners() {
      console.log(`<${fileName} initializeSocketListeners >`);
      if (socketService.socket.connected) {
        console.log("solution.store.initializeSocketListeners connected");
        this.setConnected(true);
        this.setError(null);
        socketService.socket.emit("solution.initial", { role: this.role });
      }

      socketService.socket.on("connect", () => {
        this.setConnected(true);
        this.setError(null);
        console.debug("solution.socket.id", socketService.socket.id);
      });

      socketService.socket.on("disconnect", () => {
        this.setConnected(false);
      });

      socketService.socket.on("connect_error", (error) => {
        this.setError(error.message);
      });

      socketService.socket.on("new-message", (message) => {
        console.debug("new-message:", message);
        this.addMessage(message);
      });

      socketService.socket.on("notification", (notification) => {
        console.debug("onNotification:", notification);
        this.addNotification(notification);
      });

    },

    // 发送消息到服务器
    sendMessage(message) {
      console.log("do sendMessage");
      if (this.isConnected) {
        socketService.socket.emit("send-message", message);
      }
    },

    downloadAllSolutions() {
      return new Promise((resolve, reject) => {
        if (this.isConnected) {
          socketService.socket.once("allsolutions", (data) => {
            const obj = JSON.parse(data);
            this.solutions = obj.solutions;
            this.blocks = obj.blocks;
            this.currentSolutionName = obj.current_solution_name;
            console.log(`<${fileName} allsolutions.once currentSolutionName:${this.currentSolutionName} >`);
            resolve(data);
          });
          socketService.socket.emit("allsolutions");
        }
      });
    },

    // 断开连接
    disconnect() {
      socketService.disconnect();
      this.setConnected(false);
    },
  },
});
