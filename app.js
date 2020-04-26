const path = require("path");
const socket = require("socket.io");
const express = require("express");
const http = require("http");

const SandboxLibrary = require("./sandbox/lib");
const ModLoader = SandboxLibrary.constructors.ModLoader;
const SandboxContainer = SandboxLibrary.constructors.SandboxContainer;
const UIDManager = SandboxLibrary.constructors.UIDManager;
const SandboxLoader = SandboxLibrary.constructors.SandboxLoader;

const app = express();
const server = http.createServer(app);

/*
Alerte !!!! Je pense que le mieux à terme serait d'avoir aucune classe statique
ni de méthode statique car c'est pas ouf pour la compatibilité notamment avec le this sur lequel
est basé ma ptite classe LibraryComponent.
Tout ce qui pourrait être classe statique (unique) genre SandboxContainer par exemple,
le mieux serait d'en instancier 1 et 1 seul et de le mettre dans l'espace global de la library.
Ca faciliterait grandement le développement et en + c'est cool car dans Symfony5 ça marche
un peu comme ça mais bon vous coco pas donc
*/

// Déplacer tout ça dans un endroit adapté : config.js ou init.js
SandboxLibrary.env.set("httpServer", server);
SandboxLibrary.env.set("app", app);
SandboxLibrary.env.set("socketIO", socket(server));
SandboxLibrary.env.set("sandboxPath", path.join(__dirname, "sandbox/Sandboxes/"));
SandboxLibrary.env.set("modPath", path.join(__dirname, "sandbox/Mods/"));
SandboxLibrary.env.set("sandboxContainer", new SandboxContainer());
SandboxLibrary.env.set("UIDManager", new UIDManager());
SandboxLibrary.env.set("debugLevel", "note");
SandboxLibrary.env.set("modLoader", new ModLoader());
SandboxLibrary.env.set("sandboxLoader", new SandboxLoader());


/*const LibraryComponent = require("./sandbox/lib/LibraryComponent");
LibraryComponent.debug("note", 1);
LibraryComponent.debug("log", 2);
LibraryComponent.debug("warning", 3);
LibraryComponent.debug("error", 4);*/

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
SandboxLibrary.env.get("UIDManager")
.create("sandbox", basicIterator, checkValidity, { lastValue: 0 })
.create("mod", basicIterator, checkValidity, { lastValue: 0 });

/*const test = SandboxLibrary.globals.get("UIDManager").get("sandbox");

console.log(test.nextValue());
console.log(test.nextValue());
console.log(test.nextValue());

console.log(test.isValid("056"));

console.log(Sandbox.getAbsolutePath("001"));*/

//const sandboxContainer = SandboxLibrary.globals.get("sandboxContainer");

const sandboxLoader = SandboxLibrary.env.get("sandboxLoader");
const promise = sandboxLoader.instanciateFromFolder("001");

promise.then(sandboxInstance => sandbox = sandboxInstance).catch(console.log);

//Sandbox.instanciateFromDirectory(Sandbox.getAbsolutePath("002"));

// Mieux gérer Promesse instanciation
// container.on("sandboxLoaded")