const socketIO = require('socket.io');
const url = require('url');

const EventEmitter = require('events').EventEmitter;
const Room = require('./Room');

class RoomsManager extends EventEmitter
{
    constructor(config = {})
    {
        super();

        this.httpServer = config.httpServer;
        this.express = config.express;
        this.app = config.app;
        this.io = socketIO(this.httpServer);

        this.rooms = {};
        
        this.initApp();
    }

    initApp()
    {
        this.app.get('/', (req, res) => 
        {
            res.render('joining.ejs', {rooms: this.getRoomsData()});
        });

        this.app.get('/createRoom', (req, res) => 
        {
            res.redirect('/');
        });

        this.app.post('/createRoom', (req, res) => 
        {
            let randomLetter = Math.random().toString(36).substring(7);
            let randomNumber = Math.floor((Math.random() * 1000) + 1);
            let uidRandomizer = randomNumber + randomLetter;
            const UID = uidRandomizer;

            if(!this.rooms[UID])
            {
                this.rooms[UID] = new Room({
                    io: this.io,
                    UID: UID,
                    name: req.body.name,
                    motd: req.body.motd,
                    size: req.body.size
                });

                //redirige l'utilisateur vers /room?UID='UID'
                res.redirect(url.format({
                    pathname:'/room',
                    query : {"UID": UID}
                }));
            }
            else
            {
                //TODO : trouver un truc plus malinx que les GET pour passer les erreurs

                res.redirect(url.format({
                    pathname:'/',
                    query : {"error": "Room UID already exist"}
                }));
            }
        });

        this.app.get('/room', (req, res) => 
        {
            const UID = req.query.UID;

            if(this.rooms[UID])
            {
                res.render('room.ejs', this.rooms[UID].data);
            }
            else
            {
                res.redirect(url.format({
                    pathname:'/',
                    query : {"error": "Room not found"}
                }));
            }
        });
    }

    getRoomsData()
    {
        const roomsData = [];
            
        for(const room in this.rooms)
        {
            roomsData.push(this.rooms[room].data);
        }
        
        return roomsData;
    }
}

module.exports = RoomsManager;