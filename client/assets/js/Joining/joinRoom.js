class JoinRoom
{
    constructor(joiningManager)
    {
        this.joiningManager = joiningManager;
    
        // TODO : init la list des rooms
        // TODO : rajouter un evenement sur les rooms de la liste pour les rejoindres

        this.refreshRoomsList();
    }

    refreshRoomsList()
    {
        //TODO : recuperer les rooms et refresh la room list coter client
        //mdr c un test
        

    }

    async join(roomName)
    {
        this.joiningManager.roomSocket = io.connect(`${this.joiningManager.server}/${roomName}`);
        
        console.log(`Tentative de connection a la room  ${roomName}`);

        this.joiningManager.roomSocket.emit('join', {name: 'robert'});

        this.joiningManager.roomSocket.on('joinResponse', (response = {}) => 
        {
            // TODO : lorsque le joueur na pas de nom recuperer le nom que le serveur lui donne
            
            if(response.success)
            {
                console.log(`Connection a la room ${response.roomName} réussie !`)
                
                // TODO : finir de rejoindre la room (changement de page pour afficher celle de la room)
            }
            else
            {
                console.warn(`Erreur lors de la connection a la room ${response.roomName} : ${response.errorMessage}`);
            }
        });
    }
}

export default JoinRoom;