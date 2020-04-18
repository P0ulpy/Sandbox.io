class JoinRoom
{
    constructor(joiningManager)
    {
        this.joiningManager = joiningManager;
        this.refreshList = document.getElementById('refreshList');
        this.listeRoom = document.getElementById('listeRoom')
        this.refreshRoomsList();
        // TODO : Noms des rooms à la place du nombre de room
        // TODO : Afficher toutes les données dans data
        
        // TODO : rajouter un evenement sur les rooms de la liste pour les rejoindres
        this.refreshList.addEventListener('click', () => {
            this.joiningManager.socket.emit('getRoom');
            this.joiningManager.socket.on('getRoomresponse', (roomNames) => {
                let affListe = "";
                
                for(let i = 0; i<roomNames.val.length; i++)
                {
                 affListe +=  roomNames.val[i] + "<br>";
                 
                }
                this.listeRoom.innerHTML = affListe;

            })
        })
    
       

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