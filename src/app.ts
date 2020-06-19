import SandboxInterface from "./ElementInterface/SandboxInterface";
import { getSandboxUID, getModUID } from "./UID";
import ModInterfaceContainer from "./Containers/ModInterfaceContainer";
import env from "./Environment";

// @TODO pas le choix, car dépendances circulaires non gérées
env.ModInterfaceContainer = new ModInterfaceContainer(true);

env.httpServer.listen(8080);

//var a = env.ModInterfaceContainer;

var b = new SandboxInterface(getSandboxUID("001"));

b.loadingPromise.then(handle)
.catch(() => console.log("EH MERDEEE"));

function handle(arg: SandboxInterface)
{
    console.log("Super, la sandbox interface " + arg.UID + " est chargée.");
}

var c = new ModInterfaceContainer(false);

c.load([ getModUID("002") ]);

c.accessModInterface(getModUID("002")).then((mi) => console.log(mi))
.catch((err) => console.log(err));


// @TODO Circular: créer le type Environment et le remplir APRES que tout soit chargé
// C'est dans app qu'on doit créer l'Environment je pense