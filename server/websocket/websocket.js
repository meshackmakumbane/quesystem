import { WebSocketServer, WebSocket } from "ws";

let wss;

const validateMessage = (message) => {
  return (
    typeof message === "object" &&
    message !== null &&
    typeof message.type === "string"
  );
};

export const initializeWebsocket = (server) => {
  wss = new WebSocketServer({ server });

  // Heartbeat
  const heartbeat = setInterval(() => {
    wss.clients.forEach((client) => {
      if (!client.isAlive) {
        console.log("Terminating dead connection");
        return client.terminate();
      }

      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  // New Connection
  wss.on("connection", (socket, request) => {
    const ipAddress = request.socket.remoteAddress;

    console.log(`Client connected: ${ipAddress}`);

    // Heartbeat setup
    socket.isAlive = true;

    socket.on("pong", () => {
      socket.isAlive = true;
    });

    // Incoming messages
    socket.on("message", (rawData) => {
      try {
        const message = JSON.parse(rawData.toString());

        if (!validateMessage(message)) {
          return socket.send(
            JSON.stringify({
              type: "ERROR",
              message: "Invalid message format",
            })
          );
        }

        console.log("Received:", message);

        switch (message.type) {
          case "PING":
            socket.send(
              JSON.stringify({
                type: "PONG",
              })
            );
            break;

          case "NEW_TICKET":
            console.log("New ticket event");
            break;

          default:
            console.log(`Unknown event: ${message.type}`);
        }
      } catch (err) {
        socket.send(
          JSON.stringify({
            type: "ERROR",
            message: "Invalid JSON",
          })
        );
      }
    });

    // Errors
    socket.on("error", (err) => {
      console.error("WebSocket Error:", err.message);
    });

    // Disconnect
    socket.on("close", () => {
      console.log(`Client disconnected: ${ipAddress}`);
    });
  });

  // Cleanup
  wss.on("close", () => {
    clearInterval(heartbeat);
  });
};

export const broadcast = (data) => {
  if (!wss) return;

  const message = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error("Broadcast Error:", err.message);
      }
    }
  });
};