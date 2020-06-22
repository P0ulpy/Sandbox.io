const LibraryComponent = require('../LibraryComponent');
const fs = require('fs');
const path = require('path');
const express = require('express'); 
const { type } = require('os');

class RoutesManager extends LibraryComponent
{
    constructor()
    {
        super();

        this.functions = require("./RoutesFunctions.js");
        this.initApp();

        this.getRoutesFile()
        .then((routes) => 
        {   
            this.loadStatics(routes);
            this.loadRoutes('get', routes);
            this.loadRoutes('post', routes);
        })
        .catch((err) => 
        {
            throw err;
        });
    }
 
    initApp()
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

    loadStatics(routes)
    {
        for(const staticRoute of routes.static)
        {
            // TODO : gerer bien le bouzin des paths
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
                    this.debug("note", `functions [${route.functions}] appliquer a la route "${route.route}"`);
                }
                else
                {
                    this.debug("error", `impossible d'appliquer les functions [${route.functions}] a la route "${route.route}"`);
                }
            }
            else
            {
                this.debug('error', `aucune function lié a la route ${route.route} avec la method ${method}`);
            }
        }
    }

    getFunctions(functionsNames = [""])
    {
        const methods = [];

        for(const functionName of functionsNames)
        {
            if(this.functions[functionName] && typeof(this.functions[functionName]) === 'function')
            {
                // pour que le this ne soit pas override
                methods.push((req, res, next) => { this.functions[functionName](req, res, next); });
            }
            else
            {   
                this.debug("error", `RouteManager : impossible de trouver la function "${functionName}"`);
            }
        }

        // si il n'y a pas de funtions return null
        return (methods.length > 0) ? methods : null;
    }
}

module.exports = RoutesManager;