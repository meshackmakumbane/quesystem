import express from "express";
import http from "http";
import dotenv from "dotenv";

import { initializeWebsocket } from "./websocket/websocket.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

const server = http.createServer(app);

initializeWebsocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});