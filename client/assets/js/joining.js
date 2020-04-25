class Joining 
{
    constructor(config = {}) 
    {
        this.server = config.server || 'http://localhost:80';

        this.rooms = {};
        
        this.initJoin();
        this.initCreate();
    }

    // Partie Create Room

    initCreate() 
    {
        this.create_info = document.getElementById('create-info');

        this.create_inputs = document.getElementsByClassName('create-input');

        for(const input of this.create_inputs)
        {
            input.addEventListener("keyup", (event) => 
            {
                if (event.keyCode === 13) 
                {
                    event.preventDefault();
                    document.getElementById('create-submit').click();
                }
            });
        }
    }

    // Patie Join Room

    initJoin() 
    {
        this.joinRoom_refreshList = document.getElementById('join-refresh');

        this.joinRoom_refreshList.addEventListener('click', () => 
        {
            
        });

        this.rooms = document.getElementsByClassName("joinRoom-room");

        for(const room of this.rooms)
        {
            room.addEventListener('click', () => 
            {
                console.log('ça clique bien la');

                // TODO : code sweet alert
            });
        }
    }
}

const joining = new Joining();

export default Joining;