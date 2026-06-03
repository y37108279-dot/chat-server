const WebSocket = require("ws");

const port = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port });

// ユーザー管理
let users = new Map(); // ws -> name

// メッセージ保存
let messages = [];

wss.on("connection", (ws) => {

  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    // ① 入室
    if (data.type === "join") {
      users.set(ws, data.name);
      return;
    }

    // ② メッセージ送信
    if (data.type === "message") {
      const message = {
        id: Date.now(),
        name: data.name,
        message: data.message,
        readCount: 0
      };

      messages.push(message);

      broadcast({
        type: "message",
        data: message
      });

      return;
    }

    // ③ 既読
    if (data.type === "read") {

      const msg = messages.find(m => m.id === data.messageId);

      if (msg) {
        msg.readCount += 1;

        broadcast({
          type: "read",
          data: {
            messageId: msg.id,
            readCount: msg.readCount
          }
        });
      }

      return;
    }
  });

  ws.on("close", () => {
    users.delete(ws);
  });
});

function broadcast(data) {
  const payload = JSON.stringify(data);

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

console.log("running on", port);
