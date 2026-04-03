import { defineStore } from "pinia";

export const useUserViewStore = defineStore("userView", {
  state: () => ({
    // width of lower, upper, Slotx
    value_col_width: "120px",
    description_col_width: "300px",
  }),
  getters: {},
  actions: {
    async initialize() {},
  },
});
