const socketIO = require('socket.io');
const url = require('url');

const LibraryComponent = require("./LibraryComponent");

class RoomsManager extends LibraryComponent
{
    constructor(config = {})
    {
        super();

        this.rooms = new Map();

        this.app = this.env.get("app");
        this.io = this.env.get("socketIO");
        
        this.initApp();
    }

    add(room)
    {
        this.rooms.set(room.uniqueID, room);
        return this;
    }

    has(uniqueID)
    {
        return this.rooms.has(uniqueID);
    }

    get(uniqueID)
    {
        return this.rooms.get(uniqueID);
    }

    forEach(callback)
    {
        this.rooms.forEach((room, uniqueID) => callback(room, uniqueID));
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
            const UID = this.env.get("UIDManager").get("sandbox").nextValue();

            if(!this.has(UID))
            {
                const config = {
                    uniqueID: UID,
                    name: `SDB#${UID}`,
                    MOTD: `Welcome to #${UID}`,
                    mods: [ "001", "002", "004", "0088" ],
                    updateRate: 1000,
                    size: 5
                };
                const room = new this.constructors.Room(config);
                /*
                    this.rooms[UID] = new Room({
                        io: this.io,
                        UID: UID,
                        name: req.body.name,
                        motd: req.body.motd,
                        size: req.body.size
                    });
                */
               this.add(room);

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

            if(this.has(UID))
            {
                res.render('room.ejs', this.get(UID).data);
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

        this.forEach(room => roomsData.push(room.data));
 
        return roomsData;
    }
}

module.exports = RoomsManager;