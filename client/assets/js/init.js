import SandboxNamespace from "./SandboxNamespace.js";

//#region init SandboxNamespace
SandboxNamespace.env.set("AjaxManager", new SandboxNamespace.constructors.AjaxManager());
SandboxNamespace.env.set("ModLoader", new SandboxNamespace.constructors.ModLoader());
SandboxNamespace.env.set("URLManager", new SandboxNamespace.constructors.URLManager());
//#endregion init SandboxNamespace

//#region init URLManager
const URLManager = SandboxNamespace.env.get("URLManager");

URLManager.create("getModClass", { link: "/mod/_UID_/class.js", linkParams: [ "UID" ] })
.create("getSandboxInfos", { link: "/sandbox/_UID_/infos", linkParams: [ "UID" ] });
//#endregion init URLManager

//#region init AjaxManager
const ajaxManager = SandboxNamespace.env.get("AjaxManager");

ajaxManager.create("getModClass", { URLkey: "getModClass", contentType: "application/javascript" })
.create("getSandboxInfos", { URLkey: "getSandboxInfos" });
//#endregion init AjaxManager





// Trouver meilleure solution pour exécuter code qui retourne rien
export default {};