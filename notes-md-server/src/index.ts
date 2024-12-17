import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import methodOverride from "method-override";
import router from "./router";

import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import { SOCKET_MESSAGES } from "./constants/socketMessages";
import http from "http";
import { Server } from "socket.io";
import { socketConnectedListener } from "./sockets";

dotenv.config();

const PORT = Number(process.env.PORT);
const app: Express = express();
const ALLOWED_ORIGINS = ["http://localhost:3000"];

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || ALLOWED_ORIGINS.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed bu CORS!"));
			}
		},
		credentials: true,
	})
);
app.use(cookieParser());
app.use(express.json());
app.use(fileUpload({}));
app.use(express.static("static"));
app.use(methodOverride("_method"));
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use("/api", router);

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: (origin, callback) => {
			if (!origin || ALLOWED_ORIGINS.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS!"));
			}
		},
		credentials: true,
	},
});
// io.on(SOCKET_MESSAGES.CONNECTION, () => {
    // console.log('connected');
	// return socketConnectedListener(io);
// });
io.on(SOCKET_MESSAGES.CONNECTION, socketConnectedListener(io));

async function startApp() {
	try {
		await mongoose.connect("mongodb://localhost:27017/");
		server.listen(PORT, () => console.log("Server is running"));
	} catch (e) {
		console.log(e);
	}
}

startApp();
