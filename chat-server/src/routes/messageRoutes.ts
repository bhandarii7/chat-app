import { Router } from "express";
import MessageController from "../controllers/MessageController";
import { authMiddleware, authReq } from "../middleware";

const messageRoutes = Router();
messageRoutes.post("/send", authMiddleware, MessageController.send);
messageRoutes.get("/get/:receiverId",authMiddleware,MessageController.getConversation);

export default messageRoutes;