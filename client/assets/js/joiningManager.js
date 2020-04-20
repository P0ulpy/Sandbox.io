import CreateRoom from './Joining/createRoom.js'
import JoinRoom from './Joining/joinRoom.js'

class JoiningManager
{
    // TODO : mettre les metodes de JoinRoom et CreateRoom dans la class joiningManager

    constructor(config = {}) 
    {
        this.server = config.server || 'http://localhost:25565';
        this.socket = config.socket || io.connect(this.server);
        
        this.joinRoom = new JoinRoom(this);     // c'est vraiment super con comme concepte
        this.createRoom = new CreateRoom(this);
    }

    
}

// temporaire a terme joining manager sera integerer au systeme de login
const joiningManager = new JoiningManager();