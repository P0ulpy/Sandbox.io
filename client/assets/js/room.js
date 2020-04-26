import RoomClient from "./RoomClient.js";

const server = 'http://localhost:80';

const room = new RoomClient({
    server: server,
    UID: UID
},
{
    name: 'robert'
});

room.on('joinSucces', () => {
    
});

room.on('joinError', (error) => {

});