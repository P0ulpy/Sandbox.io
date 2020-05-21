import SandboxNamespace from "../SandboxNamespace.js";

const url = SandboxNamespace.env.get("URLManager");

url.create("getSandboxInfos", { link: "/sandbox/_UID_/infos", linkParams: [ "UID" ] });
url.create("autre", "http://localhost/mod/001/class.js");

//console.log(url.getRaw("getSandboxInfos"));
console.log(url.computeAsString("autre"));

export default {};