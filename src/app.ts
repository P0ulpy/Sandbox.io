import env, { initEnv } from "./Environment";

import { join } from "path";
import express from "express";
import http from "http";

initEnv();

const path = join(__dirname, "../testclient");
env.app.use("/", express.static(path));

env.httpServer.listen(80);

http.get("http://localhost/createRoom?UID=001");

/*import LoadingSandbox from "./Sandbox/LoadingSandbox";
import { getSandboxUID, getModUID } from "./UID";
import { Request, Response } from "express";
import { RoutesManager } from "./RoutesManager";*/

/*let a = new LoadingSandbox(getSandboxUID("001"))
.then((a: any) => { console.log("Résolu", a) })
.catch((err: Error) => console.log(err.message));*/

// tester publicData

/*env.roomsManager.create(getSandboxUID("001"));
const t = env.roomsManager.get(getSandboxUID("001"));

t.then(() => console.log(t.publicData));*/