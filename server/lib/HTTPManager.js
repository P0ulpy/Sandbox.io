const express = require('express');
const path = require('path');
const url = require('express');

const LibraryComponent = require('./LibraryComponent');

class HTTPManager extends LibraryComponent
{
    constructor()
    {
        super();

        this.app = this.env.get('app');
        this.UIDManager = this.env.get("UIDManager");
        this.modLoader = this.env.get("ModLoader");

        // permet de generer un acces au variables d'un POST dans req.body 
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(express.static(path.join(__dirname + '/client')));
        this.app.set('view-engine', 'ejs');

        // reference au RoomManager
        this.RM = this.env.get('RoomManager');
        
        this.setEvents();
    }

    setEvents()
    {
        this.app.get('/', (req, res) => this.getHome(req, res));
        this.app.get('/room', (req, res) => this.getRoom(req, res));
        this.app.get('/createRoom', (req, res) => res.redirect('/'));
        this.app.post('/createRoom', (req, res) => this.createRoom(req, res));
        this.app.get("/mod/:UID/", (req, res) => this.sendClientMod(req, res));
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
        const UID = this.UIDManager.get("sandbox").nextValue();

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

        this.modLoader.getClientCode(modUID).then((data) =>
        {
            res.set("Content-Type", "application/javascript");
            // send() écrase les headers
            res.end(data);
        })
        .catch((reason) =>
        {
            this.debug("error", `Can't send mod code : ${reason}`);
            res.send({ success: false });
        });
    }
}

module.exports = HTTPManager;