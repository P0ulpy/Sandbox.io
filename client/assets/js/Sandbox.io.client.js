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




ajaxManager.create("getMod", {
    URL: { link: "/mod/_UID_/", linkParams: [ "UID" ] },
    contentType: "application/javascript"
});

ajaxManager.execute("getMod", { "UID": "001" });


//a.execute().then(console.log).catch(console.log);
//a.execute().then(console.log).catch(console.log);