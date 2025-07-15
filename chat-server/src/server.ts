import { Server } from "http";
import { Socket, Server as SocketIOServer } from "socket.io";
import { Message, connectDB } from "./database";
import config from "./config/config";
import express, { Express } from "express";
import userRouter from "./routes/messageRoutes";
import Redis from "ioredis";
import cors from 'cors'

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(userRouter);
app.use(cors({
    origin: "http://localhost:3000", // frontend origin
    methods: ["GET", "POST"],
    credentials: true
  }));


let server: Server;
server = app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
    console.log('server at http://localhost:' + config.PORT);
});


connectDB();


const pub = new Redis({
    host: config.REDIS_HOST,
    port: 17592,
    username:config.REDIS_USERNAME,
    password:config.REDIS_PASSWORD
});
const sub = new Redis({
    host: config.REDIS_HOST,
    port: 17592,
    username:config.REDIS_USERNAME,
    password:config.REDIS_PASSWORD
});


const io = new SocketIOServer(server,{
    path: "/socket.io",
    cors: {
        origin: `http://localhost:${config.CLIENT_PORT}`, // allow frontend
        methods: ["GET", "POST"],
        credentials: true
      }
});
const initListener = ()=>{

    console.log('init socket')
    io.of("/chat").on('connect',(socket:Socket)=>{
        console.log("new user connected", socket.id)

        socket.on('event',async ({message})=>{
            console.log("user message",message)
            // io.emit("message", JSON.stringify({ message }));
            await pub.publish('MESSAGES',JSON.stringify({message}));
        })
    })

    sub.subscribe('MESSAGES', ()=>{
        sub.on('message', async (channel, message)=>{
            if(channel==='MESSAGES')
            {
                io.emit('message',{message})
            }
        })
    })
}

initListener();


// io.on("connection", (socket: Socket) => {
//     console.log("Client connected");
//     console.log(socket.id);
    
//     socket.on("sendMessage", (message) => {
//         io.emit("receiveMessage", message);
//     });

//     socket.on("sendMessage", async (data) => {
//         const { senderId, receiverId, message } = data;
//         const msg = new Message({ senderId, receiverId, message });
//         await msg.save();

//         io.to(receiverId).emit("receiveMessage", msg); 
//     });
// });

const exitHandler = () => {
    if (server) {
        server.close(() => {
            console.info("Server closed");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: unknown) => {
    console.error(error);
    exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);