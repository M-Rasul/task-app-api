import "dotenv/config";
import express from "express";
import prisma from "./prisma";
import usersRouter from "./routes/users";
import tokensRouter from "./routes/tokens";
import tasksRouter from "./routes/tasks";
import { errorHandler } from "./middlewares/errorHandler";
import { authenticate } from "./middlewares/authenticate";

const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/tokens", tokensRouter);

app.use(authenticate);

app.use("/api/v1/tasks", tasksRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
