import express from "express";
import http from "http";
import dotenv from "dotenv";

import { initializeWebsocket } from "./websocket/websocket.js";
import { errorHandler } from "./middleware/ErrorMiddleware.js";
import ticketRoutes from "./routes/ticketRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

const server = http.createServer(app);

initializeWebsocket(server);

/* ----- Health ----- */
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

/* ----- Routes ----- */
app.use('/v1/api/tickets', ticketRoutes);

//Error handling middleware
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});