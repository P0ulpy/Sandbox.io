import SandboxNamespace from "./SandboxNamespace.js";

const AjaxManager = SandboxNamespace.constructors.AjaxManager;
const ModLoader = SandboxNamespace.constructors.ModLoader;
const Sandbox = SandboxNamespace.constructors.Sandbox;

// equivalent de app.js pour l'instant, mais pas le but final
// pour l'instant, sert juste de test mais au final il servira juste
// a charger la library

SandboxNamespace.env.set("AjaxManager", new AjaxManager());
SandboxNamespace.env.set("ModLoader", new ModLoader());



//#region TEST AJAXMANAGER
const ajaxManager = SandboxNamespace.env.get("AjaxManager");

const config = {
    URL: "http://localhost/fr",
    HTTPMethod: "POST",
    searchParams: { "abc": 56 },
    body: { "def": "è-(" }
};
const autreConfig = config;

ajaxManager.create("getAllRooms", config)
.create("autre", autreConfig);

ajaxManager.execute("getAllRooms").then(console.log).catch(console.log);


ajaxManager.create("getMod", {
    URL: { link: "/mod/_UID_/class.js", linkParams: [ "UID" ] },
    contentType: "application/javascript"
});

ajaxManager.create("getSandboxInfos", {
    URL: { link: "/sandbox/_UID_/infos", linkParams: [ "UID" ] }
});

ajaxManager.execute("getMod", { "UID": "001" });
//#endregion TEST AJAXMANAGER

//#region TEST LOADMOD
const modLoader = SandboxNamespace.env.get("ModLoader");

modLoader.loadClassFile("http://localhost/mod/001/class.js");
//#endregion TEST LOADMOD

// aide à déboguer
window.SandboxNamespace = SandboxNamespace;

let a = new Sandbox("001");
console.log(a);

export default SandboxNamespace;