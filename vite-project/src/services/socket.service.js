import { io } from "socket.io-client";

class SocketioService {
  
  socket;
  urlObj = new URL(import.meta.url)
  fileName = this.urlObj.pathname.split('/').pop()

  constructor() {
    console.log("SocketioService. constructor");
  }

  setupSocketConnection() {
    console.log(`<${this.fileName} VITE_API_BASE_URL:${import.meta.env.VITE_API_BASE_URL}>`);
    this.socket = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log(`<${this.fileName} connect socket.id:${this.socket.id}>`);
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`<${this.fileName} disconnect reason:${reason}>`);
    });

    this.socket.on("connect_error", (error) => {
      console.log(`<${this.fileName} connect_error error:${error}>`);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // 其他自定义方法...
}

export default new SocketioService();
