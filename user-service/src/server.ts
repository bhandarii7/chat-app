import express, { Express } from "express";
import { Server } from "http";
import userRouter from "./routes";
import { connectDB } from "./database";
import config from "./config/config";
import cors from 'cors';
// import { rabbitMQService } from "./services/RabbitMQService";

const app: Express = express();
let server: Server;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(userRouter);
app.use(cors());

connectDB();

server = app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
    console.log('server at http://localhost:' + config.PORT);
});

// const initializeRabbitMQClient = async () => {
//     try {
//         await rabbitMQService.init();
//         console.log("RabbitMQ client initialized and listening for messages.");
//     } catch (err) {
//         console.error("Failed to initialize RabbitMQ client:", err);
//     }
// };

// initializeRabbitMQClient();

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