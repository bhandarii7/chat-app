import { Request, Response } from "express";
import { IUser } from "../middleware";
import { Message } from "../database";
import { ApiError } from "../utils";

const send = async (req: Request, res: Response) => {
    try {
        const { receiverId, message } = req.body;
        const { _id, email, name } = (req as Request & { user: IUser }).user;

        validateReceiver(_id, receiverId);

        const newMessage = await Message.create({
            senderId: _id,
            receiverId,
            message,
        });

        // await handleMessageReceived(name, email, receiverId, message);

        await res.json({
            status: 200,
            message: "Message sent successfully!",
            data: newMessage,
        });
    } catch (error: any) {
        await res.json({
            status: 500,
            message: error.message,
        });
    }
};

const validateReceiver = (senderId: string, receiverId: string) => {
    if (!receiverId) {
        throw new ApiError(404, "Receiver ID is required.");
    }

    if (senderId == receiverId) {
        throw new ApiError(400, "Sender and receiver cannot be the same.");
    }
};

const getConversation = async (req: Request, res: Response) => {
    try {
        const { receiverId } = req.params;
        const senderId = (req as Request & { user: IUser }).user._id;

        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        });

        await res.json({
            status: 200,
            message: "Messages retrieved successfully!",
            data: messages,
        });
    } catch (error: any) {
        await res.json({
            status: 500,
            message: error.message,
        });
    }
};

export default {
    send,
    getConversation,
};