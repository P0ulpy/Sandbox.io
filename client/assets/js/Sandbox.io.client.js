import AjaxManager from "./AjaxManager.js";

const config = {
    URL: "http://localhost/fr",
    HTTPMethod: "POST",
    searchParams: { "abc": 56 },
    body: { "def": "è-(" }
};
const autreConfig = config;

const ajaxManager = new AjaxManager();

ajaxManager.create("getAllRooms", config)
.create("autre", autreConfig);

ajaxManager.execute("getAllRooms").then(console.log).catch(console.log);

//a.execute().then(console.log).catch(console.log);
//a.execute().then(console.log).catch(console.log);