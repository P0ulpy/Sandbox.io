import http from "http";
import socket from "socket.io";
import express from "express";
import path from "path";

//import ModInterfaceContainer from "../Containers/ModInterfaceContainer";

export type Environment = {
    debugLevel: string;
    modPath: string;
    sandboxPath: string;
    // @TODO changer any
    ModInterfaceContainer: any;
    httpServer: http.Server;
    socketServer: socket.Server;
    app: express.Application;
    // @TODO ENLEVER ALIAS
    socketIO: socket.Server;
}

const app = express();
const server = http.createServer(app);
const socketServer = socket(server);

// Permer d'accéder au corps de la requête (données POST) dans req.body 
app.use(express.urlencoded({ extended: false }));
app.set('view-engine', 'ejs');
app.use(express.static(path.join(__dirname, '/client')));

const env: Environment = {
    debugLevel: "note",
    // @TODO pas propre
    modPath: path.join(__dirname, "../../Mods"),
    sandboxPath: path.join(__dirname, "../../Sandboxes"),
    ModInterfaceContainer: null,
    httpServer: server,
    app: app,
    socketServer: socketServer,
    // @TODO ENLEVER ALIAS
    socketIO: socketServer
};

export default env;