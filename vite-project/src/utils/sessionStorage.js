export const session = {
  set(key, value) {
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    sessionStorage.setItem(key, value);
  },
  get(key) {
    const data = sessionStorage.getItem(key);
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  },
  remove(key) {
    sessionStorage.removeItem(key);
  },
  clear() {
    sessionStorage.clear();
  },
};
