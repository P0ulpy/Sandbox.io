const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');
const LibraryComponent = require('../LibraryComponent');

class RoutesFunctions extends LibraryComponent
{
    constructor()
    {
        super();
        
        // reference au RoomManager
        this.RM = this.env.get('RoomsManager');

        // TODO : TEMPORAIRE

        this.users = 
        [
            {
                id: '1592865086647',
                name: 'admin@admin',
                password: '$2b$10$6fcwZXN1RuyIH6N.1tKc.OD00vOPD4UKcZWuk6JdOCuiXrKxNGXzq'
            }
        ];
    }

    getHomePage(req, res)
    {
        res.render('home.ejs');
    }

    getLoginPage(req, res)
    {
        res.render('login.ejs');
    }

    getRegisterPage(req, res, next)
    {
        res.render('register.ejs');
    }

    async register(req, res)
    {
        try
        {
            const hachedPassword = await bcrypt.hash(req.body.password, 10);

            // TODO : utiliser le generateur d'id de Antoine ou gerer directement les key depuis la DB
            // TODO : verifier si l'utilisateur n'existe pas deja
            // TODO : verifier si le format de l'email est bon 

            this.users.push({
                id : Date.now().toString(),
                name: req.body.name,
                name: req.body.email,
                password: hachedPassword
            });

            res.redirect('/login');

            console.log(this.users);
        }
        catch (err)
        {
            this.debug('error', `register error ${err}`);
            res.status(500).send({ success : false, errorMessage: `internal error`});
        }
    }

    login(req, res)
    {
        console.log(req.body);
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
            this.debug("error", `can't get room : invalid UID (${UID})`);
            res.status(500).send({ success : false, errorMessage: `can't get room : invalid UID`, UID:UID});
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
            this.debug("error", `can't create room : Duplicated UID (${UID})`);
            res.status(500).send({ success : false, errorMessage: `can't create room`});
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
    }
}

module.exports = new RoutesFunctions();