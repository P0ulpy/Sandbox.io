const path = require("path");
const SandboxLibrary = require("./sandbox/lib");
const Sandbox = SandboxLibrary.Sandbox;

const express = require("express");
const app = express();
const server = require("http").createServer(app);

console.log(__dirname);
app.use("/client", express.static(path.join(__dirname, "/client")));

server.listen(80);

// Plus tard, il faudra mieux gérer ça
SandboxLibrary.setGlobal("httpServer", server);
SandboxLibrary.setGlobal("app", app);
SandboxLibrary.setGlobal("sandboxPath", path.join(__dirname, "sandbox/Sandboxes/"));
SandboxLibrary.setGlobal("modPath", path.join(__dirname, "sandbox/Mods/"));

console.log(Sandbox.getAbsolutePath("001"));

const promise = Sandbox.instanciateFromDirectory(Sandbox.getAbsolutePath("001"));
let sandbox = null;
promise.then(sandboxInstance => sandbox = sandboxInstance).catch(console.log);