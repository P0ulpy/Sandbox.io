module.exports = function(EnvironmentMod)
{
    return class Mod001 extends EnvironmentMod
    {
        constructor(config)
        {
            super(config);

            this.updateCount = 90;
            this.currentBackground = "backgroundImg2";
        }

        update()
        {
            this.room.players.forEach((player) =>
            {
                if (player.position.x > 500)
                {
                    player.position.x = 500;
                }
                else if (player.position.x < 0)
                {
                    player.position.x = 0;
                }

                if (player.position.y > 500)
                {
                    player.position.y = 500;
                }
                else if (player.position.y < 0)
                {
                    player.position.y = 0;
                }
            });

            this.updateCount++;

            if (this.updateCount === 100)
            {
                if (this.currentBackground === "backgroundImg1")
                {
                    this.currentBackground = "backgroundImg2";
                }
                else if (this.currentBackground === "backgroundImg2")
                {
                    this.currentBackground = "backgroundImg1";
                }
                this.sendToBroadcast("set-background", this.currentBackground);
                this.updateCount = 0;
            }
        }

        onReceiveData(player, event, data)
        {
            super.onReceiveData(player, event, data);
            console.log(`ReceiveData from player ${player.username} from Env #Mod001 : ${event}`, data);
            this.sendToPlayer(player, "responseEnvironment", "bonjour");
        }
    }
};