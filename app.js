const path = require("path");
const Sandbox = require("./sandbox");

const express = require("express");
const app = express();
const server = require("http").createServer(app);


app.use("/client", express.static(path.join(__dirname, "/client")));

server.listen(80);

// Plus tard, il faudra mieux gérer ça
Sandbox.globals.httpServer = server;
Sandbox.globals.app = app;

const promise = Sandbox.instanciateFromDirectory(path.join(__dirname, "sandbox/Sandboxes/001/"));
let sandbox = null;
promise.then(sandboxInstance => sandbox = sandboxInstance).catch(console.log);