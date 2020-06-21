import express from "express";
import http from "http";
import socket from "socket.io";
import path from "path";

import SandboxInterface from "./ElementInterface/SandboxInterface";
import { getSandboxUID, getModUID } from "./UID";
import ModInterfaceContainer from "./Containers/ModInterfaceContainer";
import env from "./Environment";

const app = express();
const server = http.createServer(app);
const socketServer = socket(server);

// Permer d'accéder au corps de la requête (données POST) dans req.body 
app.use(express.urlencoded({ extended: false }));
app.set('view-engine', 'ejs');
app.use(express.static(path.join(__dirname, '/client')));

/* Obligation d'initialiser l'environnement seulement lorsque toute la biblithèque est chargée,
car les dépendances circulaires ne sont pas gérées */
env.debugLevel = "note";
env.modPath = path.join(__dirname, "../Mods");
env.sandboxPath = path.join(__dirname, "../Sandboxes"),
env.ModInterfaceContainer = new ModInterfaceContainer(true);
env.httpServer = server;
env.app = app;
env.socketServer = socketServer;
env.RoomsManager = null;

env.httpServer.listen(8080);

//var a = env.ModInterfaceContainer;

var b = new SandboxInterface(getSandboxUID("001"));

b.loadingPromise.then(handle)
.catch(() => console.log("EH MERDEEE"));

function handle(arg: SandboxInterface)
{
    console.log("Super, la sandbox interface " + arg.UID + " est chargée.");
}

var c = new ModInterfaceContainer(false);

c.load([ getModUID("002") ]);

c.accessModInterface(getModUID("002")).then((mi) => console.log(mi))
.catch((err) => console.log(err));