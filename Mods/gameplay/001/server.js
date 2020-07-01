module.exports = function(GameplayMod)
{
    return class Mod001 extends GameplayMod
    {
        constructor(config)
        {
            super(config);
        }

        onReceiveData(player, event, data)
        {
            super.onReceiveData(event, data);
            console.log(`ReceiveData from player ${player.username} Gameplay #Mod001 : ${event}`, data);
        }
    }
};