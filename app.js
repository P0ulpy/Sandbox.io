const path = require("path");
const socket = require("socket.io");
const express = require("express");
const http = require("http");

const SandboxLibrary = require("./sandbox/lib");
const Sandbox = SandboxLibrary.Sandbox;
const SandboxContainer = SandboxLibrary.SandboxContainer;
const UIDManager = SandboxLibrary.UIDManager;

const app = express();
const server = http.createServer(app);

// Déplacer tout ça dans un endroit adapté : config.js ou init.js
SandboxLibrary.setGlobal("httpServer", server);
SandboxLibrary.setGlobal("app", app);
SandboxLibrary.setGlobal("socketIO", socket(server));
SandboxLibrary.setGlobal("sandboxPath", path.join(__dirname, "sandbox/Sandboxes/"));
SandboxLibrary.setGlobal("modPath", path.join(__dirname, "sandbox/Mods/"));
SandboxLibrary.setGlobal("registeredSandboxes", new SandboxContainer());
SandboxLibrary.setGlobal("UIDManager", new UIDManager());
SandboxLibrary.setGlobal("debugLevel", 1);


app.use("/client", express.static(path.join(__dirname, "/client")));

server.listen(80);


function basicIterator()
{
    const next = this.get("lastValue") + 1;

    this.persist("lastValue", next);

    return ("00" + next).slice(-3);
};

function checkValidity(uniqueID)
{
    // Chaîne de caractère qui représente un nombre allant de 000 à 999
    return /^[0-9]{3}$/.test(uniqueID);
}

// Création de générateurs d'UID : 1 pour les sandboxes, 1 pour les mods
SandboxLibrary.getGlobal("UIDManager")
.create("sandbox", basicIterator, checkValidity, { lastValue: 0 })
.create("mod", basicIterator, checkValidity, { lastValue: 0 });

const test = SandboxLibrary.getGlobal("UIDManager").get("sandbox");

console.log(test.nextValue());
console.log(test.nextValue());
console.log(test.nextValue());

console.log(test.isValid("056"));

console.log(Sandbox.getAbsolutePath("001"));

const promise = Sandbox.instanciateFromDirectory(Sandbox.getAbsolutePath("001"));
let sandbox = null;
promise.then(sandboxInstance => sandbox = sandboxInstance).catch(console.log);