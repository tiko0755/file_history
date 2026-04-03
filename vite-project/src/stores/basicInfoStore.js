import { defineStore } from "pinia";
import { useSocketStore } from "@/stores/socket.store";

export const useBasicInfoStore = defineStore("basicInfo", {
  state: () => ({
    role: "访客",
    station: "",
    total: 0,
    time: 0,
    fails: 0,
    socket_id: null,
  }),
  getters: {
    pass_rate: (state) =>
      state.total === 0
        ? 0
        : Math.round(((state.total - state.fails) / state.total) * 10000) / 100,
  },
  actions: {
    async initialize() {
      const socketStore = useSocketStore();
      socketStore.initializeSocketListeners();
      // console.log('socketId', socketStore.socketId);
      this.socket_id = socketStore.socketId;
      console.log("basic.socket.id:", this.socket_id);
    },
    increaseFails() {
      this.total += 1;
      this.fails += 1;
    },
  },
});
