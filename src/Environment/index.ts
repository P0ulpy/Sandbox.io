import http from "http";
import socket from "socket.io";
import express from "express";

import ModInterfaceContainer from "../Containers/ModInterfaceContainer";

export type Environment = {
    debugLevel: string;
    modPath: string;
    sandboxPath: string;
    ModInterfaceContainer: ModInterfaceContainer;
    httpServer: http.Server;
    socketServer: socket.Server;
    app: express.Application;
    // @TODO changer any
    RoomsManager: any;
}

export default ({} as Environment);