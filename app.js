const path = require("path");
const socket = require("socket.io");
const express = require("express");
const http = require("http");

const SandboxLibrary = require("./server/lib");
const ModLoader = SandboxLibrary.constructors.ModLoader;
const UIDManager = SandboxLibrary.constructors.UIDManager;
const SandboxLoader = SandboxLibrary.constructors.SandboxLoader;
const RoomsManager = SandboxLibrary.constructors.RoomsManager;

const app = express();
const server = http.createServer(app);

// Déplacer tout ça dans un endroit adapté : config.js ou init.js
SandboxLibrary.env.set("httpServer", server);
SandboxLibrary.env.set("app", app);
SandboxLibrary.env.set("socketIO", socket(server));
SandboxLibrary.env.set("sandboxPath", path.join(__dirname, "server/Sandboxes/"));
SandboxLibrary.env.set("modPath", path.join(__dirname, "server/Mods/"));
SandboxLibrary.env.set("sandboxContainer", new RoomsManager());
SandboxLibrary.env.set("UIDManager", new UIDManager());
SandboxLibrary.env.set("debugLevel", "note");
SandboxLibrary.env.set("modLoader", new ModLoader());
SandboxLibrary.env.set("sandboxLoader", new SandboxLoader());

app.use(express.static(path.join(__dirname + '/client')));

// permet de generer un acces au variables d'un POST dans req.body 
app.use(express.urlencoded({ extended: false }));
app.set('view-engine', 'ejs');

/* BEGINNING OF DEGUEULASSE CODE */
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
/* END OF DEGUEULASSE CODE */

//const room = SandboxLibrary.env.get("sandboxLoader").instanciateFromFolder("001");

//const roomsManager = new RoomsManager({httpServer: server, express: express, app:app});

server.listen(80);