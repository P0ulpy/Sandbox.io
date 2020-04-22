const path = require("path");
const Sandbox = require("./sandbox");

const express = require("express");
const app = express();
const server = require("http").createServer(app);


app.use("/client", express.static(path.join(__dirname, "/client")));

server.listen(80);

// new Sandbox()
// new Sandbox.Environment()
// new Sandbox.Player()
// new Sandbox.Item()
// new Sandbox.UserInterface()
// a = new Sandbox.Mod()
// a.client && a.server

const config =
{
    updateRate: 1000,
    httpServer: server,
    mods: [ "001", "002", "004", "0088" ]
}

const mySandbox = new Sandbox(config);
mySandbox.on("update", function()
{

});