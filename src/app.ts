import env, { initEnv } from "./Environment";

initEnv();

env.httpServer.listen(8080);

import LoadingSandbox from "./Sandbox/LoadingSandbox";
import { getSandboxUID, getModUID } from "./UID";

let a = new LoadingSandbox(getSandboxUID("001"))
.then((a: any) => { console.log("Résolu", a) })
.catch((err: Error) => console.log(err.message));