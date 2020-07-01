// sendToPlayer() et sendToBroadcast()

module.exports = function(GameplayMod)
{
    return class Mod001 extends GameplayMod
    {
        constructor(config)
        {
            super(config);
        }

        update()
        {
            const positions = [];

            this.room.players.forEach((player) =>
            {
                positions.push({ position: player.position, sprite: player.getCustomData("sprite") });
            });

            this.sendToBroadcast("update", positions);
        }

        onReceiveData(player, event, data)
        {
            super.onReceiveData(player, event, data);

            if (event === "get-sprite" && !player.getCustomData("sprite"))
            {
                const alea = Math.floor(Math.random() * Math.floor(this.resources.length + 1));
                const sprite = `sprite${alea}Img`;

                player.setCustomData("sprite", sprite);
                this.sendToPlayer(player, "set-sprite", sprite);
            }

            if (event === "move")
            {
                this.movePlayer(player, data);
            }
        }

        movePlayer(player, data)
        {
            const speed = 3;

            if (data === "left")
            {
                player.position.x -= speed;
            }
            else if (data === "right")
            {
                player.position.x += speed;
            }
            else if (data === "up")
            {
                player.position.y -= speed;
            }
            else if (data === "down")
            {
                player.position.y += speed;
            }
        }
    }
};