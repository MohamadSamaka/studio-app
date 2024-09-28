const WebSocket = require("ws");
const { verifyToken } = require("./tokens"); // Import your verifyToken function
const { ACCESS_TOKEN_SECRET } = require("../config/env");

let wss;

const initializeWebSocketServer = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      ws.close(4001, "Missing token");
      return;
    }

    try {
      // Verify the token and extract user information
      const user = verifyToken(token, ACCESS_TOKEN_SECRET);

      // Attach user information to the WebSocket connection
      ws.user = user;

      ws.on("message", (message) => {
        console.log(`Received message from ${user.username}: ${message}`);
        handleMessage(ws, message);
      });

      ws.on("close", () => {
        console.log(`WebSocket connection closed for user: ${user.username}`);
      });
    } catch (err) {
      console.error("Token verification failed:", err);
      ws.close(4002, "Invalid token");
    }
  });
};

const handleMessage = (ws, message) => {
  try {
    console.log("handleMessage function is called");

    // Parse the incoming message
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (err) {
      console.log("Failed to parse message:", err);
      ws.send(JSON.stringify({ error: "Invalid message format" }));
      return;
    }

    // Implement role-based handling
    switch (parsedMessage.type) {
      case "UPDATING_CONFIG":
        console.log("Handling UPDATING_CONFIG");
        if (ws.user.role !== "admin") {
          ws.send(JSON.stringify({ error: "Unauthorized action" }));
          return;
        }
        // Handle admin-specific action
        updateConfig(parsedMessage.payload);
        break;
      default:
        console.log("Unknown message type:", parsedMessage.type);
        ws.send(JSON.stringify({ error: "Unknown message type" }));
    }
  } catch (error) {
    console.error("Error in handleMessage:", error);
    ws.send(JSON.stringify({ error: "Server error" }));
  }
};

const updateConfig = (config) => {
  // Implement admin-specific logic here
  console.log("Performing admin action with payload:", config);
  // For example, broadcasting a message to all clients
  broadcastMessage({ type: "ADMIN_MESSAGE", data: { config: config } });
};

const broadcastMessage = (senderId, data) => {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.user.id !== senderId) {
      client.send(message);
    }
  });
};

const broadcastConfigUpdate = (senderId, updatedConfig) => {
  const message = {
    type: "CONFIG_UPDATED",
    config: updatedConfig,
  };
  broadcastMessage(senderId, message);
};

module.exports = { initializeWebSocketServer, broadcastConfigUpdate };
