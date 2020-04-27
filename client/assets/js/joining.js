class Joining {
    constructor(config = {}) {
        this.server = config.server || 'http://localhost:80';

        this.rooms = {};

        this.initJoin();
        this.initCreate();
    }

    // Partie Create Room

    initCreate() {
        this.create_info = document.getElementById('create-info');
        //this.elements = document.getElementsByClassName("joinRoom-room");
        this.create_inputs = document.getElementsByClassName('create-input');

        for (const input of this.create_inputs) {
            input.addEventListener("keyup", (event) => {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    document.getElementById('create-submit').click();
                }
            });
        }
    }

    // Patie Join Room

    initJoin() {
        this.joinRoom_refreshList = document.getElementById('join-refresh');
        this.joinRoom_refreshList.addEventListener('click', () => {

        });

        this.rooms = document.getElementsByClassName("joinRoom-room");
        this.joinRoom_Input = document.getElementById("UID");
        this.joinRoom_Button = document.getElementById("join-submit");
        
        for (let i = 0; i < this.rooms.length; i++) 
        {
            this.rooms[i].addEventListener('click', () => 
            {

                let attribute = this.rooms[i].getAttribute("id");
                Swal.fire({
                    title: 'Connection à : ' +  attribute,
                    text: "Vous voulez vous connecter à  " + attribute,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: "Rejoindre"
                  }).then((result) => {
                    if (result.value) 
                    {
                        this.joinRoom_Input.value = attribute;
                        this.joinRoom_Button.click();
                    }
                  })

            }, false);
        }

    }
}

const joining = new Joining();

export default Joining;