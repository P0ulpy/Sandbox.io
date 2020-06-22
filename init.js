
const path = require("path");

function initApp(app)
{
    const SandboxLibrary = require("./server/lib");
    const { Z_TEXT } = require("zlib");
    
    const ModLoader = SandboxLibrary.constructors.ModLoader;
    const UIDManager = SandboxLibrary.constructors.UIDManager;
    const RoomLoader = SandboxLibrary.constructors.RoomLoader;
    const RoomsManager = SandboxLibrary.constructors.RoomsManager;
    const RoutesManager = SandboxLibrary.constructors.RoutesManager;
    const SandboxLoader = SandboxLibrary.constructors.SandboxLoader;
    const SandboxInterface = SandboxLibrary.constructors.SandboxInterface;
    const ModInterface = SandboxLibrary.constructors.ModInterface;
    const ModInterfaceContainer = SandboxLibrary.constructors.ModInterfaceContainer;
    
    SandboxLibrary.env.set("httpServer", app.server);
    SandboxLibrary.env.set("app", app.app);
    SandboxLibrary.env.set("socketIO", app.socketio);
    SandboxLibrary.env.set("sandboxPath", path.join(__dirname, "server/Sandboxes/"));
    SandboxLibrary.env.set("modPath", path.join(__dirname, "server/Mods/"));
    SandboxLibrary.env.set("RoomsManager", new RoomsManager());
    SandboxLibrary.env.set("UIDManager", new UIDManager());
    SandboxLibrary.env.set("debugLevel", "note");
    SandboxLibrary.env.set("ModLoader", new ModLoader());
    SandboxLibrary.env.set("RoomLoader", new RoomLoader());
    SandboxLibrary.env.set("RoutesManager", new RoutesManager());
    SandboxLibrary.env.set("SandboxLoader", new SandboxLoader());
    SandboxLibrary.env.set("ModInterfaceContainer", new ModInterfaceContainer(true));   
}

module.exports = initApp;