import { defineStore } from "pinia";
import socketService from "../services/socket.service";

export const useUIStore = defineStore("ui", {
  state: () => ({
    isConnected: false,
    messages: [],
    notifications: [],
    connectionError: null,
    role: "访客",
    station: "",
    total: 0,
    time: 0,
    fails: 0,
    header: {
      description: {
        enable: true,
      },
      lower: {
        enable: false,
      },
      upper: {
        enable: false,
      },
      unit: {
        enable: true,
      },
      slot1: {
        enable: true,
      },
      slot2: {
        enable: true,
      },
      slot3: {
        enable: true,
      },
      slot4: {
        enable: true,
      },
      slot5: {
        enable: true,
      },
      slot6: {
        enable: true,
      },
      slot7: {
        enable: true,
      },
      slot8: {
        enable: true,
      },
    },
    rows: [],
    socket_id: null,
    value_col_width: "120px",
    description_col_width: "300px",
  }),

  getters: {
    pass_rate: (state) =>
      Math.round(((state.total - state.fails) / state.total) * 10000) / 100,
    tableData: (state) => state.rows.map((row) => row.text),
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
    initializeListeners() {
      if (socketService.socket.connected) {
        this.setConnected(true);
        this.setError(null);
        socketService.socket.emit("ui.initial", { role: this.role });
      }
      socketService.socket.on("connect", () => {
        this.setConnected(true);
        this.setError(null);
        console.debug("<ui> socket.onConnect id", socketService.socket.id);
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

      // 监听工站名称
      socketService.socket.on("ui.station.name", (station_name) => {
        console.debug("station_name:", station_name);
        this.station = station_name;
      });

      // 监听统计信息
      socketService.socket.on("ui.station.statistict", (statistict) => {
        console.debug("statistict:", statistict);
        this.total = statistict.total || 0;
        this.fails = statistict.fails || 0;
        this.time = statistict.time || 0;
      });

      // 监听测试表头
      socketService.socket.on("ui.station.header", (header) => {
        console.debug("header:", header);
        this.header = header;
      });

      // 监听测试行
      socketService.socket.on("ui.station.rows", (rows) => {
        console.debug("ui.station.rows:", rows);
        this.rows = rows;
      });

      socketService.socket.on("ui.station.row.header.text", (id, text) => {
        for (const row of this.rows) {
          if (row.id !== id) {
            continue;
          }
          row.text.description = text.description;
          row.text.lower = text.lower;
          row.text.upper = text.upper;
          row.text.unit = text.unit;
          console.log("ui.station.row.header.text.rows", this.rows);
          break;
        }
      });

      socketService.socket.on("ui.station.row.header.style", (id, style) => {
        for (const row of this.rows) {
          if (row.id !== id) {
            continue;
          }
          row.style.description = style.description;
          row.style.lower = style.lower;
          row.style.upper = style.upper;
          row.style.unit = style.unit;
          console.log("ui.station.row.header.text.rows", this.rows);
          break;
        }
      });

      socketService.socket.on(
        "ui.station.row.slotcell",
        (row_id, slot, text, style, ack) => {
          let done = false;
          for (const row of this.rows) {
            if (row.id !== row_id) {
              continue;
            }
            row.text[slot] = text;
            row.style[slot] = style;
            console.log("ui.station.row.slotcell.text.rows", this.rows);
            ack("success");
            done = true;
            break;
          }
          if (!done) ack("error! cannot find the row with id: " + row_id);
        },
      );

      // 监听测试时间
    },

    // 发送消息到服务器
    sendMessage(message) {
      if (this.isConnected) {
        socketService.socket.emit("send-message", message);
      }
    },

    // 断开连接
    disconnect() {
      socketService.disconnect();
      this.setConnected(false);
    },
  },
});
