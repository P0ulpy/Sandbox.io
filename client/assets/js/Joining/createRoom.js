class CreateRoom
{
    constructor(joiningManager)
    {
        this.joiningManager = joiningManager;

        this.roomNameInput = document.getElementById('roomName');
        this.infoText = document.getElementById('infoText');
        this.createRoomButton = document.getElementById('createRoomButton');
        
        this.build();
    }
    
    build()
    {
        this.roomNameInput.addEventListener("keyup", function(event)
        {
            if (event.keyCode === 13) {
                event.preventDefault();
                document.getElementById("createRoomButton").click();
            }
        })
        this.createRoomButton.addEventListener('click', () =>
        {
            const roomName = this.roomNameInput.value;
    
            if(roomName)
            {
                console.log(`Tentative de création de la room  ${roomName}`);
                this.joiningManager.socket.emit('createRoom', {name: roomName});

                this.joiningManager.socket.on('createRoomResponse', (response) =>
                {
                    if(response.success)
                    {
                        console.log(`Création de la room ${response.roomName} réussie !`)
                        
                        this.joiningManager.joinRoom.join(roomName);
                        
                        this.infoText.innerHTML = '';
                        this.roomNameInput.value = '';
                    }
                    else
                    {
                        console.warn(`Erreur lors de la création de la room ${response.roomName} : ${response.errorMessage}`);
                        this.infoText.innerHTML = response.errorMessage;
                    }
                });
            }
            else
            {
                this.infoText.innerHTML = "Please enter a room name";
            }
        });
    }
}

export default CreateRoom;