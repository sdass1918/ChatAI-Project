import express from "express";
import cors from "cors";

import aiRouter  from "./routes/aiRoutes";
import authRouter from "./routes/authRoutes";
import { authMiddleware } from "./middleware/auth-middleware";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World! You are in the backend of the chatAI!");
});

app.use('/auth', authRouter);
app.use('/ai', aiRouter);



app.listen(3000, () => {
  console.log("Server is running on port 3000");
});