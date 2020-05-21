import SandboxNamespace from "./SandboxNamespace.js";
import init from "./init.js";

import * as yoyo from "./tests/URLManager.js";


const Sandbox = SandboxNamespace.constructors.Sandbox;

// equivalent de app.js pour l'instant, mais pas le but final
// pour l'instant, sert juste de test mais au final il servira juste
// a charger la library




//#region TEST LOADMOD
const modLoader = SandboxNamespace.env.get("ModLoader");

//modLoader.fetchModClass("001");
//#endregion TEST LOADMOD

// aide à déboguer
window.SandboxNamespace = SandboxNamespace;

let a = new Sandbox("001");
console.log(a);

export default SandboxNamespace;