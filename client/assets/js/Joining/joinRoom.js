class JoinRoom {
    constructor(joiningManager) {
        this.joiningManager = joiningManager;
        this.refreshList = document.getElementById('refreshList');
        this.listeRoom = document.getElementById('listeRoom')

        // TODO : Afficher toutes les données de data
        // TODO : rajouter un evenement onClick ou on focus sur les rooms de la liste pour les rejoindres
        //this.refreshRoomsList();
        //TODO : Faire que la liste soit clickable et bordel faire en sorte que "entrer" permette de créer une room marre de cliquer sur le bouton
        this.refreshList.addEventListener('click', () => {
            this.joiningManager.socket.emit('getRoom');
            this.joiningManager.socket.on('getRoomresponse', (data) => {
                let affListe = "";
                console.log(data.data[0])
                for(let i in data.data)
                {
                    affListe +=  "<li>"+ "Nom : " +data.data[i].name + " Taille : " + data.data[i].size  +  " Motd : " + data.data[i].motd + "</li>";//"<br><br>";
                }

                this.listeRoom.innerHTML = affListe;


              

            })
        })
    }

    refreshRoomsList() {
        //TODO : recuperer les rooms et refresh la room list coter client
        //mdr c un test


    }

    async join(roomName) {
        this.joiningManager.roomSocket = io.connect(`${this.joiningManager.server}/${roomName}`);

        console.log(`Tentative de connection a la room  ${roomName}`);

        this.joiningManager.roomSocket.emit('join', {
            name: 'robert'
        });

        this.joiningManager.roomSocket.on('joinResponse', (response = {}) => {
            // TODO : lorsque le joueur na pas de nom recuperer le nom que le serveur lui donne

            if (response.success) {
                console.log(`Connection a la room ${response.roomName} réussie !`)

                // TODO : finir de rejoindre la room (changement de page pour afficher celle de la room)
            } else {
                console.warn(`Erreur lors de la connection a la room ${response.roomName} : ${response.errorMessage}`);
            }
        });
    }
}

export default JoinRoom;