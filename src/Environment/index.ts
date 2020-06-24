import http from "http";
import socket from "socket.io";
import express from "express";
import path from "path";

import { Logger, LogLevel } from "../Tools";
import { RoomsManager } from "../Room";

export type Environment = {
    logLevel: LogLevel;
    logger: Logger;
    modPath: string;
    sandboxPath: string;
    httpServer: http.Server;
    socketServer: socket.Server;
    app: express.Application;
    roomsManager: RoomsManager;
    routesDefinitionFile: string;
}

let isEnvironmentInitialized = false;
const env = {} as Environment;

export function initEnv(): void
{
    if (isEnvironmentInitialized)
    {
        throw new Error("You can only initialize the environment 1 time");
    }

    const app = express();
    const server = http.createServer(app);
    const socketServer = socket(server);

    // Permer d'accéder au corps de la requête (données POST) dans req.body 
    app.use(express.urlencoded({ extended: false }))
    .set('view-engine', 'ejs')
    .use(express.static(path.join(__dirname, '/client')));

    env.logLevel = LogLevel.LEVEL_NOTE;
    env.logger = new Logger();
    env.modPath = path.join(__dirname, "../../Mods");
    env.sandboxPath = path.join(__dirname, "../../Sandboxes"),
    env.httpServer = server;
    env.app = app;
    env.socketServer = socketServer;
    env.roomsManager = new RoomsManager();
    env.routesDefinitionFile = path.join(__dirname, "../../routes.json");

    isEnvironmentInitialized = true;
}

export default env;