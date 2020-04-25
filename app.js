const path = require("path");
const SandboxLibrary = require("./sandbox/lib");
const Sandbox = SandboxLibrary.Sandbox;
const SandboxContainer = SandboxLibrary.SandboxContainer;
const UIDManager = SandboxLibrary.UIDManager;

const express = require("express");
const app = express();
const server = require("http").createServer(app);

console.log(__dirname);
app.use("/client", express.static(path.join(__dirname, "/client")));

server.listen(80);

// Déplacer tout ça dans un endroit adapté : config.js ou init.js
SandboxLibrary.setGlobal("httpServer", server);
SandboxLibrary.setGlobal("app", app);
SandboxLibrary.setGlobal("sandboxPath", path.join(__dirname, "sandbox/Sandboxes/"));
SandboxLibrary.setGlobal("modPath", path.join(__dirname, "sandbox/Mods/"));
SandboxLibrary.setGlobal("registeredSandboxes", new SandboxContainer());
SandboxLibrary.setGlobal("UIDManager", new UIDManager());

SandboxLibrary.getGlobal("UIDManager").create("sandbox", function()
{
    const next = this.get("lastValue") + 1;

    this.persist("lastValue", next);

    return next.toString();
}, { lastValue: 0 })
.create("mod", function()
{
    const next = this.get("lastValue") + 1;

    this.persist("lastValue", next);

    return next.toString();
}, { lastValue: 0 });

const test = SandboxLibrary.getGlobal("UIDManager").get("sandbox");

console.log(test.nextValue());
console.log(test.nextValue());
console.log(test.nextValue());

console.log(Sandbox.getAbsolutePath("001"));

const promise = Sandbox.instanciateFromDirectory(Sandbox.getAbsolutePath("001"));
let sandbox = null;
promise.then(sandboxInstance => sandbox = sandboxInstance).catch(console.log);