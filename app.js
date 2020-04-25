const path = require("path");
const socket = require("socket.io");
const express = require("express");
const http = require("http");

const SandboxLibrary = require("./sandbox/lib");
const Sandbox = SandboxLibrary.constructors.Sandbox;
const SandboxContainer = SandboxLibrary.constructors.SandboxContainer;
const UIDManager = SandboxLibrary.constructors.UIDManager;

const app = express();
const server = http.createServer(app);

// Déplacer tout ça dans un endroit adapté : config.js ou init.js
SandboxLibrary.globals.set("httpServer", server);
SandboxLibrary.globals.set("app", app);
SandboxLibrary.globals.set("socketIO", socket(server));
SandboxLibrary.globals.set("sandboxPath", path.join(__dirname, "sandbox/Sandboxes/"));
SandboxLibrary.globals.set("modPath", path.join(__dirname, "sandbox/Mods/"));
SandboxLibrary.globals.set("registeredSandboxes", new SandboxContainer());
SandboxLibrary.globals.set("UIDManager", new UIDManager());
SandboxLibrary.globals.set("debugLevel", 1);

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
SandboxLibrary.globals.get("UIDManager")
.create("sandbox", basicIterator, checkValidity, { lastValue: 0 })
.create("mod", basicIterator, checkValidity, { lastValue: 0 });

const test = SandboxLibrary.globals.get("UIDManager").get("sandbox");

console.log(test.nextValue());
console.log(test.nextValue());
console.log(test.nextValue());

console.log(test.isValid("056"));

console.log(Sandbox.getAbsolutePath("001"));

const promise = Sandbox.instanciateFromDirectory(Sandbox.getAbsolutePath("001"));
let sandbox = null;
promise.then(sandboxInstance => sandbox = sandboxInstance).catch(console.log);