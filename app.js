const init = require("./init");

const express = require("express");
const http = require("http");
const socket = require("socket.io");

this.app = express();
this.server = http.createServer(this.app);
this.socketio = socket(this.server);

init(this);

this.server.listen(80);