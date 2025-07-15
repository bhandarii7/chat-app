import mongoose, { Schema, Document } from "mongoose";

enum Status {
    NotDelivered = "NotDelivered",
    Delivered = "Delivered",
    Seen = "Seen",
}

export interface IMessage extends Document {
    senderId: string;
    receiverId: string;
    message: string;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'users'
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'users'
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(Status),
            default: Status.NotDelivered,
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model<IMessage>("Message", MessageSchema);
export default Message;