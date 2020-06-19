const LibraryComponent = require('../LibraryComponent');
const fs = require('fs');
const path = require('path');
const express = require('express'); 

class RoutesManager extends LibraryComponent
{
    constructor()
    {
        super();

        this.functions = require("./RoutesFunctions.js");
        this.setupApp();

        this.getRoutesFile()
        .then((routes) => 
        {   
            this.loadStatic(routes);
            this.loadRoutes('get', routes);
            this.loadRoutes('post', routes);
        })
        .catch((err) => 
        {
            throw err;
        });
    }
 
    setupApp()
    {
        this.app = this.env.get("app");

        this.app.use(express.urlencoded({ extended: false }));
        this.app.set('view-engine', 'ejs');
    }

    getRoutesFile()
    {
        return new Promise((resolve, reject) => 
        {
            // get routes configuration file
            fs.readFile(path.join(__dirname + '/routes.json'), (err, content) => 
            {
                if(err) reject(err);
                else resolve(JSON.parse(content));
            });
        });
    }

    loadStatic(routes)
    {
        for(const staticRoute of routes.static)
        {
            // TODO : gerer bien le bouzin des path
            this.app.use(express.static(path.join(__dirname + staticRoute)));
        }
    }

    loadRoutes(method = "get", routes)
    {
        this.debug("log", `chargement des routes avec la method "${method}"`);

        const _routes = routes[method]; 

        for(const route of _routes)
        {
            if(route.functions)
            {
                const functions = this.getFunctions(route.functions);

                if(functions)
                {
                    this.app[method](route.route, ...functions);
                    this.debug("note", `functions [${route.functions}] appliquer a la route ${route.route}`);
                }
                else
                {
                    this.debug("error", `impossible d'appliquer les functions [${route.functions}] a la route ${route.route}`);
                }
            }
            else
            {
                this.app[method](route.route, (req, res) => 
                {
                    res.redirect('/');
                })
            }
        }
    }

    getFunctions(functionsNames = [""])
    {
        const methods = [];

        for(const functionName of functionsNames)
        {
            const _function = this.functions[functionName];

            if(_function)
            {
                // pour que le this ne soit pas override
                methods.push((req, res, next) => { _function(req, res, next); });
            }
            else
            {   
                this.debug("error", `RouteManager : impossible de trouver la function "${functionName}"`);
            }
        }

        // si il n'y a pas de funtions trouvé return null
        return (methods.length > 0) ? methods : null;
    }















    /*
    constructor()
    {
        super();

        this.app = this.env.get('app');

        // permet de generer un acces au variables d'un POST dans req.body 
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(express.static(path.join(__dirname + '/client')));
        this.app.set('view-engine', 'ejs');

        // reference au RoomManager
        this.RM = this.env.get('RoomManager');


        //TODO : c'est la que tout commence



        this.setEvents();
    }
    
    setEvents()
    {
        
        this.app.get('/', (req, res) => this.getHome(req, res));
        this.app.get('/room', (req, res) => this.getRoom(req, res));
        this.app.get('/createRoom', (req, res) => res.redirect('/'));
        this.app.post('/createRoom', (req, res) => this.createRoom(req, res));
        this.app.get("/mod/:UID/class.js", (req, res) => this.sendClientMod(req, res));
        this.app.get("/sandbox/:UID/infos", (req, res) => this.sendSandboxInfos(req, res));
        
    }

    getHome(req, res)
    {
            res.render('joining.ejs', 
        {
            rooms: this.RM.getRoomsData()
        });
    }

    getRoom(req, res)
    {
        const UID = req.query.UID;

        if(this.RM.has(UID))
        {
            res.render('room.ejs', this.RM.get(UID).data);
        }
        else
        {
            res.redirect('/');
        }
    }

    createRoom(req, res)
    {
        const UID = this.env.get("UIDManager").get("sandbox").nextValue();

        if(!this.RM.has(UID))
        {
            const config = {
                UID: UID,
                name: `SDB#${UID}`,
                MOTD: `Welcome to #${UID}`,
                mods: [ "001", "002", "004", "0088" ],
                updateRate: 1000,
                size: 5
            };
            
            const room = new this.constructors.Room(config);
            this.RM.add(room);

            //redirige l'utilisateur vers /room?UID='UID'
            res.redirect(url.format({
                pathname:'/room',
                query : {"UID": UID}
            }));
        }
        else
        {
            //TODO : trouver un truc plus malinx que les GET pour passer les erreurs
            res.redirect('/');
        }
    }

    sendClientMod(req, res)
    {
        // Pour l'instant, on se contente d'envoyer le fichier client.js en brut
        const modUID = req.params.UID;
        const modLoader = this.env.get("ModLoader");

        modLoader.getModconfig(modUID).then(modConfig =>
        {
            this.debug("note", `Sending client class for mod #${modUID}`);
            res.sendFile(modConfig.clientClassPath);
        })
        .catch(error =>
        {
            this.debug("error", `Can't send mod code : ${error}`);
            res.status(500).send({ success: false, errorMessage: error });
        });
    }

    sendSandboxInfos(req, res)
    {
        const UID = req.params.UID;
        const UIDManager = this.env.get("UIDManager");

        if (UIDManager.get("sandbox").isValid(UID))
        {
            this.env.get("SandboxLoader").getPublicInfos(UID).then(data =>
            {
                res.send(data);
            })
            .catch((err) =>
            {
                this.debug("error", err);
                res.status(500).send({ status: false, errorMessage: "Internal error", errorData: { UID: UID } });
            });
        }
        else
        {
            res.status(500).send({ status: false, errorMessage: "Invalid Sandbox UID", errorData: { UID: UID } });
        }
    }*/
}

module.exports = RoutesManager;