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
    }

    getHome(req, res)
    {
        res.render('joining.ejs', 
        {
            rooms: this.RM.getRoomsData()
        });
    }

    getRoom(req, res, next) 
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
}

module.exports = HTTPManager;