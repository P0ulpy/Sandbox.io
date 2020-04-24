import RoomClient from "./RoomClient.js";

class JoiningManager {
    constructor(config = {}) {
        this.server = config.server || 'http://localhost:25565';
        this.globalSocket = config.socket || io.connect(this.server);

        this.rooms = {};
        
        this.initJoinRoom();
        this.initCreateRoom();
    }

    // Partie Create Room

    initCreateRoom() 
    {
        this.elements = document.getElementsByClassName("button1");
        this.refreshList = document.getElementById('refreshList');
        this.listeRoom = document.getElementById('listeRoom')
        this.createRoom_name = document.getElementById('createRoom-name');
        this.createRoom_info = document.getElementById('createRoom-info');
        this.createRoom_createButton = document.getElementById('createRoom-createButton');

        this.refreshList.addEventListener('click', () => 
        {
            this.refreshRoomList();
        });

        //Appuyer sur le bouton "entrer" pour lancer onclick
        this.createRoom_name.addEventListener("keyup", function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                document.getElementById("createRoom-createButton").click();
            }
        })

        this.createRoom_createButton.addEventListener('click', () => {
            const roomName = this.createRoom_name.value;

            if (roomName) {
                console.log(`Tentative de création de la room  ${roomName}`);

                // quand un emit de createRoom est fait on attend une response qui est recuperer dans l'evenement 'createRoomResponse'
                // l'objet envoyer correspond au données de la room (nom, taille, motd, ect...)
                this.globalSocket.emit('createRoom', {
                    name: roomName
                });
            } else {
                this.createRoom_info.innerHTML = 'Please enter a room name';
            }
        });

        // met la function onCreateRoom comme evenement lorsque le serveur repond a la creation d'une room
        this.globalSocket.on('createRoomResponse', (response) => 
        {
            if (response.success) 
            {
                console.log(`Création de la room ${response.roomUID}:${response.roomName} réussie !`)

                // fait rejoindre la room au joueur qui la crée

                this.joinRoom(response.roomUID);

                this.createRoom_info.innerHTML = '';
                this.createRoom_name.value = '';
            } else {
                console.warn(`Erreur lors de la création de la room ${response.roomName} : ${response.errorMessage}`);
                this.createRoom_info.innerHTML = response.errorMessage;
            }
        });
    }

    // Patie Join Room

    getRemoteRooms(onResonseCallBack = () => {})
    {
        // permet de recupere les "rooms" qui existe coter serveur (elles sont stocke dans this.rooms)
        // (si je met rooms en "" c'est par ce que les rooms que l'on recupere ne sont pas exactement celles coter serveur c'est uniquement ce qu'on veut bien montrer au client) 
        
        this.globalSocket.emit('getRooms');
        this.globalSocket.once('getRoomsResponse', (rooms) => 
        {
            console.log('fetching remote rooms...', rooms);
            this.rooms = rooms;

            if(typeof onResonseCallBack === 'function')
            {
                onResonseCallBack(rooms);
            }
        });
    }

    initJoinRoom() 
    {
        this.refreshRoomList();
    }

    refreshRoomList() {
        // permet de recupere les "rooms" qui existe coter serveur (elles sont stocke dans this.rooms)
        // (si je met rooms en "" c'est par ce que les rooms que l'on recupere ne sont pas exactement celles coter serveur c'est uniquement ce qu'on veut bien montrer au client) 
        this.getRemoteRooms((roomsData) => 
        {
            let affListe = "";

            for (let i in roomsData) 
            {
                affListe += '<li><button class="button1" id="' + roomsData[i].UID + '">' + "Nom : " + roomsData[i].name + " Taille : " + roomsData[i].size + " Motd : " + roomsData[i].motd + "UID debug" + roomsData[i].UID + "</button></li>"; //"<br><br>";
            }

            this.listeRoom.innerHTML = affListe;

            for (let i = 0; i < this.elements.length; i++) 
            {
                this.elements[i].addEventListener('click', () => 
                {
                    const attribute = this.elements[i].getAttribute("id");
                    const choice = confirm("Vous voulez vous connecter à  " + attribute);

                    if(choice === true)
                    {
                        this.joinRoom(attribute);
                    }

                });
            }

        });
    }

    joinRoom(UID) 
    {
        this.getRemoteRooms((rooms) => 
        {
            
            // cette verification n'est que coter client elle ne sert qu'a éviter les bugs client 
            // elle n'est pas une preuve que la room existe ou pas il ne faut donc pas si fier coter serveur 
            if (rooms[UID]) 
            {
                // TODO : lorsque le joueur na pas de nom recuperer le nom que le serveur lui donne

                if(this.room)
                {
                    //this.room.socket.connection.end();
                }

                this.room = new RoomClient(
                {
                    server: this.server,
                    UID: UID
                },
                {
                    name: 'robert'
                });

                this.room.on('joinSucces', () => {
                    
                });

                this.room.on('joinError', (error) => {

                });
                
            } else {
                console.warn(`La room ${UID} n'existe pas`);
            }
        });
    }
}

// temporaire a terme joining manager sera integerer au systeme de login
const joiningManager = new JoiningManager();

export default JoiningManager;