const WebSocket = require("ws");

const port = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port });

// ★チャット履歴（メモリ保存）
let messages = [];

wss.on("connection", (ws) => {
  console.log("Client connected");

  // ★接続した瞬間に履歴を送る
  ws.send(JSON.stringify({
    type: "history",
    data: messages
  }));

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());

      const message = {
        name: data.name,
        message: data.message,
        time: Date.now()
      };

      // ★履歴に保存
      messages.push(message);

      // ★全員に送信
      const payload = JSON.stringify({
        type: "message",
        data: message
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });

    } catch (err) {
      console.log("error:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("running on", port);
