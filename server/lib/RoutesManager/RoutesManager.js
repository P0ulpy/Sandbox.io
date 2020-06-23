/*
le fonctionement du RouteManager est en 3 temps :

- la première partie c'est routes.json qui en somme contien toutes les informations nécéssaire a faire la liaison 
entre method (GET / POST) route ("/", "/home", ect...) et functions la premère etapes lorque l'on ajoute une route
c'est de remplir routes.json

- la deuxième partie de ce RouteManager c'est RoutesFunctions qui en soit est le fichier le plus simple 
c'est simplement un obj qui contient des functions, lorsque l'on veut rajouter une route c'est dans 
RoutesFunction.js que l'on vas rajouter le/les function(s) nécessaire au fonctionnement de la route 

- la dernière partie et le coeur du système c'est ce fichier RouteManager.js qui permet de géré
l'ajout de toutes les routes a une method (POST/GET) et les functions associer au routes, 
il permet aussi de géré les routes static et toutes les initialisations de app

voila vous etes complement armé pour utiliser RouteManager have fun

*/

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

    getRoutesFile(filepath = "/routes.json")
    {
        return new Promise((resolve, reject) => 
        {
            // get routes configuration file
            fs.readFile(path.join(__dirname + filepath), (err, content) => 
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